import {request} from 'node:http';
import type {SendResult} from './handoff.ts';

export const fixtureModel = 'sp09-synthetic-v1';

export class FixtureProviderFailure extends Error {
  readonly category: 'provider_timeout' | 'provider_budget_exhausted';

  constructor(category: FixtureProviderFailure['category']) {
    super(category);
    this.category = category;
  }
}

export function fixtureProvider(value: string | undefined): URL | undefined {
  if (value === undefined) return undefined;
  const url = new URL(value);
  if (url.protocol !== 'http:' || url.hostname !== '127.0.0.1' || !url.port ||
      url.username || url.password || url.pathname !== '/generate' || url.search || url.hash) {
    throw new Error('SP-09 fixture provider must be an explicit loopback HTTP /generate URL');
  }
  return url;
}

export function relay(url: URL, payload: Buffer, signal: AbortSignal):
  Promise<SendResult<{response: Promise<unknown>}>> {
  if (signal.aborted) return Promise.resolve({outcome: 'aborted'});
  const controller = new AbortController();
  const responseDeadline = AbortSignal.timeout(2000);
  const transport = AbortSignal.any([controller.signal, responseDeadline]);
  let acceptDraft!: (value: unknown) => void;
  let rejectDraft!: (reason: unknown) => void;
  const response = new Promise<unknown>((resolve, reject) => {
    acceptDraft = resolve;
    rejectDraft = reject;
  });
  void response.catch(() => {});
  return new Promise(resolve => {
    let connected = false;
    let finished = false;
    const abort = () => controller.abort();
    const writeDeadline = setTimeout(abort, 350);
    const req = request(url, {
      agent: false,
      method: 'POST', signal: transport,
      headers: {'content-type': 'application/json', 'content-length': payload.length},
    }, res => {
      const chunks: Buffer[] = [];
      let size = 0;
      res.on('data', (chunk: Buffer) => {
        size += chunk.length;
        if (size > 32768) res.destroy(new FixtureProviderFailure('provider_budget_exhausted'));
        else chunks.push(chunk);
      });
      res.on('error', error => rejectDraft(responseDeadline.aborted ? new FixtureProviderFailure('provider_timeout') : error));
      res.on('end', () => {
        try {
          if (res.statusCode === 429) throw new FixtureProviderFailure('provider_budget_exhausted');
          if (res.statusCode !== 200) throw new Error('Fixture generation unavailable');
          acceptDraft(JSON.parse(Buffer.concat(chunks).toString('utf8')));
        } catch (error) {
          rejectDraft(error);
        }
      });
    });
    signal.addEventListener('abort', abort, {once: true});
    req.once('socket', socket => socket.once('connect', () => { connected = true; }));
    const cleanup = () => {
      clearTimeout(writeDeadline);
      signal.removeEventListener('abort', abort);
    };
    req.once('finish', () => {
      if (controller.signal.aborted) return;
      finished = true;
      cleanup();
      resolve({outcome: 'completed', value: {response}});
    });
    req.on('error', error => rejectDraft(responseDeadline.aborted ? new FixtureProviderFailure('provider_timeout') : error));
    req.once('close', () => {
      cleanup();
      if (!finished) resolve({outcome: connected ? 'unknown' : 'aborted'});
    });
    req.end(payload);
  });
}
