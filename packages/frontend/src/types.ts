import type { Caido } from "@caido/sdk-frontend";

// Define JWT analyzer events
export type JWTAnalyzerEvents = {
  "jwt:analyzed": (finding: Finding) => void;
  "request:captured": (request: CapturedRequest) => void;
  "requests:cleared": () => void;
};

// Define our frontend SDK type
export type FrontendSDK = Caido<any> & {
  notifications?: {
    success: (message: string) => void;
    error: (message: string) => void;
    info: (message: string) => void;
    warning: (message: string) => void;
  };
  window?: {
    showToast: (message: string, options?: {
      variant?: 'success' | 'error' | 'warning' | 'info';
      duration?: number;
    }) => void;
    getActiveEditor?: () => any;
  };
  contextMenu?: {
    register: (options: {
      group: string;
      items: Array<{
        label: string;
        handler: (context: any) => void | Promise<void>;
      }>;
    }) => void;
  };
  backend: {
    analyzeJWT: (params: {
      token: string;
      requestId: string;
      source: 'request' | 'response' | 'manual';
    }) => Promise<{ kind: string; value?: Finding; error?: string }>;
    getRequests: () => Promise<{ kind: string; value?: CapturedRequest[]; error?: string }>;
    getRequest: (id: string) => Promise<{ kind: string; value?: CapturedRequest; error?: string }>;
    clearRequests: () => Promise<{ kind: string; error?: string }>;
    onEvent: <K extends keyof JWTAnalyzerEvents>(
      event: K,
      callback: JWTAnalyzerEvents[K]
    ) => void;
  };
};

export interface Finding {
  id: string;
  title: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  customName?: string;
  metadata: {
    source: 'request' | 'response' | 'manual';
    token: string;
    header: JWTHeader;
    payload: JWTPayload;
    expStatus: 'valid' | 'expired' | 'not_yet_valid';
    timeLeft: string;
    issuer?: string;
    subject?: string;
    audience?: string;
    expiresAt?: string;
    issuedAt?: string;
    risks?: JWTRisk[];
    suggestions?: string[];
    severity?: 'critical' | 'high' | 'medium' | 'low' | 'info';
  };
}

export interface JWTHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  origAlg?: string;
  [key: string]: any;
}

export interface JWTPayload {
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  iss?: string;
  [key: string]: any;
}

export interface JWTRisk {
  type?: string;
  severity: 'critical' | 'high' | 'medium' | 'low' | 'info';
  description: string;
  impact?: string;
}

/**
 * Represents a captured HTTP request with potential JWT tokens
 */
export interface CapturedRequest {
  id: string;
  timestamp: number;
  method: string;
  url: string;
  headers: Record<string, string>;
  hasJwt: boolean;
  jwtLocations?: string[];
  response?: {
    statusCode: number;
    headers: Record<string, string>;
    hasJwt?: boolean;
    jwtLocations?: string[];
  };
}
