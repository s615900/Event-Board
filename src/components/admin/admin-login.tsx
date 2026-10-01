'use client';

import { useEffect, useState, type FormEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ShieldCheck, TriangleAlert, Zap } from 'lucide-react';
import { useAuth } from '@/lib/auth';

const ERROR_MESSAGES: Record<string, string> = {
  not_member: '你的帳號尚未被加入成員名冊，請聯繫管理者',
  lookup_failed: '無法連線至成員名冊，請稍後再試',
  oauth_failed: 'Google 登入失敗，請再試一次',
  google_error: 'Google 回傳了錯誤（可能是你取消了授權），請重新登入',
  no_state: '登入逾時或缺少必要參數，請重新整理頁面後再試一次',
  state_mismatch: '登入驗證失敗（state 不符），可能是瀏覽器封鎖了 cookie 或登入逾時，請重新登入',
  missing_credentials: '伺服器尚未設定 Google OAuth 憑證，請聯繫管理者',
  token_exchange_failed: '向 Google 換取權杖（token）失敗，請稍後再試或聯繫管理者',
  userinfo_failed: '向 Google 取得使用者資料失敗，請稍後再試或聯繫管理者',
};

export function AdminLogin() {
  const router = useRouter();
  const { status, refresh } = useAuth();
  const [testModeEnabled, setTestModeEnabled] = useState(false);
  const [testEmail, setTestEmail] = useState('');
  const [testError, setTestError] = useState('');
  const [testLoading, setTestLoading] = useState(false);

  const errorCode = useSearchParams().get('error');

  useEffect(() => {
    if (status === 'authed') router.replace('/admin');
  }, [status, router]);

  useEffect(() => {
    fetch('/api/auth/config')
      .then(r => (r.ok ? r.json() : null))
      .then((d: { testModeEnabled?: boolean } | null) => { if (d?.testModeEnabled) setTestModeEnabled(true); })
      .catch(() => {});
  }, []);

  const testLogin = async (e: FormEvent) => {
    e.preventDefault();
    setTestError('');
    setTestLoading(true);
    try {
      const res = await fetch('/api/auth/test-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ email: testEmail }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({} as { error?: string }));
        setTestError(data.error || '登入失敗');
        return;
      }
      await refresh();
      router.push('/admin');
    } finally {
      setTestLoading(false);
    }
  };

  return (
    <div className="grid min-h-[100dvh] place-items-center bg-[#17364a] px-5 text-[#f8f4ec]">
      <div className="w-full max-w-md rounded-2xl border border-[#355665] bg-[#1d3f54] p-8 shadow-2xl">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-lg bg-[#ed7659] text-[#fff8ee] shadow-[4px_4px_0_#0a7782]">
            <Zap size={21} fill="currentColor" />
          </span>
          <div>
            <p className="font-display text-xl font-bold leading-none">賽事報 管理後台</p>
            <p className="mt-1 text-[10px] font-bold tracking-[.2em] text-[#8da7aa]">ADMIN LOGIN</p>
          </div>
        </div>
        <p className="mt-8 text-sm leading-6 text-[#c7d4d3]">請使用受邀成員的 Google 帳號登入管理後台。</p>

        {errorCode && (
          <div data-testid="text-login-error" className="mt-5 flex items-start gap-2 rounded-lg bg-[#4a2a26] px-4 py-3 text-sm text-[#f3c9bd]">
            <TriangleAlert size={16} className="mt-0.5 shrink-0" />
            <span>{ERROR_MESSAGES[errorCode] || '登入失敗，請再試一次'}</span>
          </div>
        )}

        <a
          href="/api/auth/google"
          data-testid="button-google-login"
          className="mt-7 flex items-center justify-center gap-2 rounded-lg bg-[#f8f4ec] px-4 py-3 text-sm font-bold text-[#213746] transition hover:bg-white"
        >
          <ShieldCheck size={17} className="text-[#087f8c]" /> 使用 Google 登入
        </a>

        {testModeEnabled && (
          <div className="mt-8 rounded-xl border border-dashed border-[#d2a83e] bg-[#3a331f] p-4">
            <p data-testid="text-test-mode-label" className="flex items-center gap-2 text-xs font-bold text-[#f5ca6e]">
              <TriangleAlert size={14} /> 測試模式（僅供開發測試，正式環境不會出現）
            </p>
            <p className="mt-2 text-xs leading-5 text-[#d8c48f]">
              輸入成員名冊中的 Email 以模擬登入結果，不會經過 Google 驗證。
            </p>
            <form onSubmit={testLogin} className="mt-3 flex gap-2">
              <input
                value={testEmail}
                onChange={e => setTestEmail(e.target.value)}
                type="email"
                required
                placeholder="member@example.com"
                data-testid="input-test-login-email"
                className="min-w-0 flex-1 rounded-lg border border-[#5c4f2c] bg-[#241f13] px-3 py-2 text-sm text-[#f8f4ec] outline-none"
              />
              <button
                type="submit"
                disabled={testLoading}
                data-testid="button-test-login"
                className="rounded-lg bg-[#d2a83e] px-4 py-2 text-sm font-bold text-[#241f13] transition disabled:opacity-60"
              >
                登入
              </button>
            </form>
            {testError && <p data-testid="text-test-login-error" className="mt-2 text-xs text-[#f3c9bd]">{testError}</p>}
          </div>
        )}
      </div>
    </div>
  );
}
