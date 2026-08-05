export type ProviderMessage = {
  role: "system" | "user" | "assistant";
  content: string;
};

export type CompletionInput = {
  messages: ProviderMessage[];
  temperature?: number;
  maxTokens?: number;
};

export type CompletionOutput = {
  content: string;
  model: string;
  providerId: string;
  tokenEstimate?: number;
};

export interface AiProvider {
  readonly id: string;
  readonly displayName: string;
  isAvailable(): boolean;
  complete(input: CompletionInput): Promise<CompletionOutput>;
}
