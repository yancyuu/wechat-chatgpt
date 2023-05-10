export let globalReplyState: 'text' | 'art' = 'text'

export function setGlobalReplyState(state: 'text' | 'art'): void {
  globalReplyState = state
}