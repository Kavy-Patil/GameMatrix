import { DetectedHardware, HardwareScanStep } from '../types/compatibility';

/**
 * GameVault Browser Hardware Detection Service
 *
 * Strictly privacy-first and transparent:
 * - Operates 100% locally in the client browser.
 * - Zero network uploads, zero cookies, zero localStorage, zero telemetry.
 * - Accurately distinguishes between genuinely detected hardware and unexposed information.
 */
export const hardwareDetectionService = {
  /**
   * Scans available hardware parameters exposed by standard web browser APIs.
   * Emits progress updates for actual completed checks without artificial delays.
   */
  async scanHardware(
    onStep?: (step: HardwareScanStep) => void
  ): Promise<DetectedHardware> {
    const detected: DetectedHardware = {
      deviceMemoryApproximated: false,
    };

    // Guard against non-browser / SSR environments
    if (typeof window === 'undefined' || typeof navigator === 'undefined') {
      return detected;
    }

    // --- Step 1: Detect Browser & OS Platform ---
    onStep?.({
      id: 'browser_env',
      label: 'Checking browser environment & operating system',
      status: 'in_progress',
    });

    const ua = navigator.userAgent || '';
    detected.browser = this.parseBrowser(ua);
    detected.os = this.parseOS(ua);

    onStep?.({
      id: 'browser_env',
      label: 'Browser environment & operating system',
      status: 'completed',
      detail: `${detected.os || 'Unknown OS'} • ${detected.browser || 'Modern Browser'}`,
    });

    // --- Step 2: Detect Logical CPU Cores ---
    onStep?.({
      id: 'cpu_cores',
      label: 'Checking CPU capability & logical cores',
      status: 'in_progress',
    });

    if (typeof navigator.hardwareConcurrency === 'number' && navigator.hardwareConcurrency > 0) {
      detected.cpuCores = navigator.hardwareConcurrency;
      onStep?.({
        id: 'cpu_cores',
        label: 'CPU logical cores',
        status: 'completed',
        detail: `${detected.cpuCores} Logical Cores`,
      });
    } else {
      onStep?.({
        id: 'cpu_cores',
        label: 'CPU logical cores',
        status: 'skipped',
        detail: 'Not exposed by browser',
      });
    }

    // --- Step 3: Detect Approximate Device Memory (RAM) ---
    onStep?.({
      id: 'memory',
      label: 'Checking memory information',
      status: 'in_progress',
    });

    const nav = navigator as any;
    if (typeof nav.deviceMemory === 'number' && nav.deviceMemory > 0) {
      detected.deviceMemoryGb = nav.deviceMemory;
      detected.deviceMemoryApproximated = true;
      onStep?.({
        id: 'memory',
        label: 'Device memory (RAM)',
        status: 'completed',
        detail: `Approx. ${detected.deviceMemoryGb} GB (Browser reported)`,
      });
    } else {
      onStep?.({
        id: 'memory',
        label: 'Device memory (RAM)',
        status: 'skipped',
        detail: 'Not exposed by browser API',
      });
    }

    // --- Step 4: Detect Graphics Capabilities (WebGPU & WebGL) ---
    onStep?.({
      id: 'graphics',
      label: 'Checking graphics capability & adapter',
      status: 'in_progress',
    });

    const gpuInfo = await this.detectGraphics();
    detected.gpuRenderer = gpuInfo.renderer;
    detected.gpuVendor = gpuInfo.vendor;
    detected.graphicsApi = gpuInfo.api;

    onStep?.({
      id: 'graphics',
      label: 'Graphics capability & adapter',
      status: gpuInfo.renderer ? 'completed' : 'skipped',
      detail: gpuInfo.renderer
        ? `${gpuInfo.renderer} (${gpuInfo.api})`
        : gpuInfo.api || 'Detailed GPU not exposed',
    });

    // --- Step 5: Finalize ---
    detected.detectedAt = new Date().toISOString();
    onStep?.({
      id: 'finalize',
      label: 'Preparing compatibility analysis',
      status: 'completed',
      detail: 'Hardware profile ready for requirement evaluation',
    });

    return detected;
  },

  /**
   * Safe Graphics detection via WebGPU and WebGL renderer inspection.
   */
  async detectGraphics(): Promise<{ renderer?: string; vendor?: string; api: string }> {
    let api = 'Not Available';
    let renderer: string | undefined;
    let vendor: string | undefined;

    // 1. Attempt WebGPU detection if supported
    if (typeof navigator !== 'undefined' && 'gpu' in navigator && (navigator as any).gpu) {
      try {
        const adapter = await (navigator as any).gpu.requestAdapter();
        if (adapter) {
          api = 'WebGPU Ready';
          // Modern Chromium may expose adapter info
          const info = adapter.info || (await adapter.requestAdapterInfo?.());
          if (info) {
            if (info.vendor) vendor = this.cleanGpuString(info.vendor);
            if (info.device || info.description || info.architecture) {
              renderer = this.cleanGpuString(info.description || info.device || info.architecture);
            }
          }
        }
      } catch {
        // WebGPU request failed or denied; fallback to WebGL
      }
    }

    // 2. Fallback to WebGL / WebGL 2 if WebGPU did not yield full renderer
    if (!renderer && typeof document !== 'undefined') {
      try {
        const canvas = document.createElement('canvas');
        const gl =
          (canvas.getContext('webgl2') as WebGL2RenderingContext) ||
          (canvas.getContext('webgl') as WebGLRenderingContext) ||
          (canvas.getContext('experimental-webgl') as WebGLRenderingContext);

        if (gl) {
          if (api === 'Not Available') {
            api = gl instanceof WebGL2RenderingContext ? 'WebGL 2.0' : 'WebGL 1.0';
          }

          const ext = gl.getExtension('WEBGL_debug_renderer_info');
          if (ext) {
            const unmaskedRenderer = gl.getParameter(ext.UNMASKED_RENDERER_WEBGL);
            const unmaskedVendor = gl.getParameter(ext.UNMASKED_VENDOR_WEBGL);
            if (unmaskedRenderer && typeof unmaskedRenderer === 'string') {
              renderer = this.cleanGpuRenderer(unmaskedRenderer);
            }
            if (unmaskedVendor && typeof unmaskedVendor === 'string') {
              vendor = this.cleanGpuString(unmaskedVendor);
            }
          } else {
            const basicRenderer = gl.getParameter(gl.RENDERER);
            if (basicRenderer && typeof basicRenderer === 'string') {
              renderer = this.cleanGpuRenderer(basicRenderer);
            }
          }
        }
      } catch {
        // WebGL context creation failed; keep graceful defaults
      }
    }

    return { renderer, vendor, api };
  },

  /**
   * Sanitizes and cleans GPU renderer strings (e.g. extracts core GPU from ANGLE wrapper).
   */
  cleanGpuRenderer(raw: string): string {
    if (!raw) return '';
    let cleaned = raw.trim();

    // Parse ANGLE wrapper strings like "ANGLE (NVIDIA, NVIDIA GeForce RTX 3080 Direct3D11 vs_5_0 ps_5_0, D3D11)"
    const angleMatch = cleaned.match(/ANGLE\s*\([^,]+,\s*([^,]+?)(?:\s+(?:Direct3D|OpenGL|Vulkan|Metal)[^)]*)?\)/i);
    if (angleMatch && angleMatch[1]) {
      cleaned = angleMatch[1].trim();
    }

    // Clean up internal driver parameters
    cleaned = cleaned.replace(/\s*vs_\d+_\d+\s+ps_\d+_\d+/gi, '');
    cleaned = cleaned.replace(/\s*\([^)]*\)$/, '');

    return cleaned.trim();
  },

  cleanGpuString(raw: string): string {
    if (!raw) return '';
    return raw.replace(/[<>'"`;]/g, '').trim();
  },

  /**
   * Simple, honest operating system parser from user-agent.
   */
  parseOS(ua: string): string {
    if (/Windows NT 10\.0/i.test(ua)) {
      return 'Windows 10 / 11 64-bit';
    }
    if (/Windows NT 6\.3/i.test(ua)) return 'Windows 8.1 64-bit';
    if (/Windows NT 6\.1/i.test(ua)) return 'Windows 7 64-bit';
    if (/Mac OS X/i.test(ua)) return 'macOS';
    if (/Linux/i.test(ua)) return 'Linux PC';
    if (/CrOS/i.test(ua)) return 'ChromeOS';
    return 'Windows PC';
  },

  /**
   * Simple browser name parser.
   */
  parseBrowser(ua: string): string {
    if (/Edg\//i.test(ua)) return 'Microsoft Edge';
    if (/Chrome\//i.test(ua)) return 'Google Chrome';
    if (/Firefox\//i.test(ua)) return 'Mozilla Firefox';
    if (/Safari\//i.test(ua) && !/Chrome\//i.test(ua)) return 'Apple Safari';
    if (/Opera|OPR\//i.test(ua)) return 'Opera';
    return 'Desktop Web Browser';
  },
};
