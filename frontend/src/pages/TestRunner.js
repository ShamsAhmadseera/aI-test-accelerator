import React, { useState } from 'react';
import { testService } from '../services/api';

const AUTH_TYPES = ['NONE', 'BEARER', 'BASIC', 'API_KEY'];
const METHODS = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'];
const METHOD_COLORS = { GET: 'var(--accent-green)', POST: 'var(--accent-blue)', PUT: 'var(--accent-yellow)', PATCH: 'var(--accent-purple)', DELETE: 'var(--accent-red)' };

const Tab = ({ label, active, onClick, color = 'var(--accent-green)' }) => (
  <button onClick={onClick} style={{
    padding: '10px 20px', background: 'none', border: 'none',
    color: active ? color : 'var(--text-muted)',
    borderBottom: active ? `2px solid ${color}` : '2px solid transparent',
    fontSize: '11px', letterSpacing: '1.5px', transition: 'all var(--transition)',
    marginBottom: '-1px',
  }}>{label}</button>
);

const CodeBlock = ({ code, language }) => (
  <div style={{ position: 'relative' }}>
    <div style={{ position: 'absolute', top: '12px', right: '12px', zIndex: 1 }}>
      <button onClick={() => navigator.clipboard.writeText(code)} style={{
        padding: '4px 10px', background: 'var(--bg-secondary)', border: '1px solid var(--border)',
        borderRadius: 'var(--radius)', color: 'var(--text-muted)', fontSize: '10px', letterSpacing: '1px',
        transition: 'all var(--transition)',
      }}
      onMouseEnter={e => { e.currentTarget.style.color = 'var(--accent-green)'; e.currentTarget.style.borderColor = 'var(--accent-green)'; }}
      onMouseLeave={e => { e.currentTarget.style.color = 'var(--text-muted)'; e.currentTarget.style.borderColor = 'var(--border)'; }}
      >COPY</button>
    </div>
    <pre style={{
      background: 'var(--bg-secondary)', border: '1px solid var(--border)',
      borderRadius: 'var(--radius-lg)', padding: '20px', overflow: 'auto',
      fontSize: '12px', lineHeight: '1.6', color: 'var(--text-primary)',
      maxHeight: '500px', whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    }}>{code || `// Click "Generate ${language?.toUpperCase()}" to produce code`}</pre>
  </div>
);

const inputStyle = {
  width: '100%', padding: '10px 14px',
  background: 'var(--bg-secondary)', border: '1px solid var(--border)',
  borderRadius: 'var(--radius)', color: 'var(--text-primary)',
  fontSize: '13px', outline: 'none', transition: 'border-color var(--transition)',
};

export default function TestRunner() {
  const [form, setForm] = useState({
    endpoint: '', method: 'GET', authType: 'NONE',
    authToken: '', apiKey: '', apiKeyHeader: 'X-API-Key',
    basicUsername: '', basicPassword: '',
    headers: {}, payload: '', expectedStatusCode: 200, description: '',
  });
  const [headerRows, setHeaderRows] = useState([{ key: '', value: '' }]);
  const [tab, setTab] = useState('form');
  const [codeTab, setCodeTab] = useState('restassured');
  const [result, setResult] = useState(null);
  const [codes, setCodes] = useState({ restassured: '', gatling: '', postman: '' });
  const [loading, setLoading] = useState({ run: false, ra: false, gatling: false, postman: false });

  const set = (k, v) => setForm(p => ({ ...p, [k]: v }));

  const buildRequest = () => ({
    ...form,
    headers: Object.fromEntries(headerRows.filter(r => r.key).map(r => [r.key, r.value])),
  });

  const runTest = async () => {
    setLoading(p => ({ ...p, run: true }));
    try {
      const res = await testService.runTest(buildRequest());
      setResult(res.data);
      setCodes({ restassured: res.data.generatedRestAssured || '', gatling: res.data.generatedGatling || '', postman: res.data.generatedPostman || '' });
      setTab('result');
    } catch (e) { alert('Test run failed: ' + (e.response?.data?.message || e.message)); }
    finally { setLoading(p => ({ ...p, run: false })); }
  };

  const generate = async (type) => {
    setLoading(p => ({ ...p, [type]: true }));
    try {
      const fns = { restassured: testService.generateRestAssured, gatling: testService.generateGatling, postman: testService.generatePostman };
      const res = await fns[type](buildRequest());
      setCodes(p => ({ ...p, [type]: res.data.code }));
      setTab('code'); setCodeTab(type);
    } catch (e) { alert('Generation failed: ' + (e.response?.data?.message || e.message)); }
    finally { setLoading(p => ({ ...p, [type]: false })); }
  };

  return (
    <div style={{ padding: '32px', maxWidth: '1200px' }}>
      <div style={{ marginBottom: '28px' }}>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '24px', fontWeight: 800, letterSpacing: '2px' }}>TEST RUNNER</div>
        <div style={{ color: 'var(--text-muted)', fontSize: '12px', marginTop: '4px' }}>Configure, execute, and generate AI-powered test artifacts</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', alignItems: 'start' }}>
        {/* Left - Form */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--border)', fontSize: '11px', color: 'var(--text-muted)', letterSpacing: '2px' }}>API CONFIGURATION</div>
          <div style={{ padding: '20px' }}>

            {/* Endpoint + Method */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>ENDPOINT</label>
              <div style={{ display: 'flex', gap: '8px' }}>
                <select value={form.method} onChange={e => set('method', e.target.value)} style={{ ...inputStyle, width: '100px', color: METHOD_COLORS[form.method] }}>
                  {METHODS.map(m => <option key={m} value={m}>{m}</option>)}
                </select>
                <input value={form.endpoint} onChange={e => set('endpoint', e.target.value)} placeholder="https://api.example.com/endpoint" style={{ ...inputStyle, flex: 1 }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            </div>

            {/* Auth */}
            <div style={{ marginBottom: '16px' }}>
              <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>AUTHENTICATION</label>
              <select value={form.authType} onChange={e => set('authType', e.target.value)} style={{ ...inputStyle, marginBottom: '8px' }}>
                {AUTH_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
              </select>
              {form.authType === 'BEARER' && (
                <input value={form.authToken} onChange={e => set('authToken', e.target.value)} placeholder="Bearer token" style={inputStyle}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              )}
              {form.authType === 'API_KEY' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={form.apiKeyHeader} onChange={e => set('apiKeyHeader', e.target.value)} placeholder="Header name" style={{ ...inputStyle, width: '140px' }} />
                  <input value={form.apiKey} onChange={e => set('apiKey', e.target.value)} placeholder="API Key value" style={{ ...inputStyle, flex: 1 }}
                    onFocus={e => e.target.style.borderColor = 'var(--accent-blue)'}
                    onBlur={e => e.target.style.borderColor = 'var(--border)'}
                  />
                </div>
              )}
              {form.authType === 'BASIC' && (
                <div style={{ display: 'flex', gap: '8px' }}>
                  <input value={form.basicUsername} onChange={e => set('basicUsername', e.target.value)} placeholder="Username" style={{ ...inputStyle, flex: 1 }} />
                  <input type="password" value={form.basicPassword} onChange={e => set('basicPassword', e.target.value)} placeholder="Password" style={{ ...inputStyle, flex: 1 }} />
                </div>
              )}
            </div>

            {/* Headers */}
            <div style={{ marginBottom: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px' }}>HEADERS</label>
                <button onClick={() => setHeaderRows(p => [...p, { key: '', value: '' }])} style={{ background: 'none', border: 'none', color: 'var(--accent-green)', fontSize: '18px', lineHeight: 1 }}>+</button>
              </div>
              {headerRows.map((row, i) => (
                <div key={i} style={{ display: 'flex', gap: '8px', marginBottom: '6px' }}>
                  <input value={row.key} onChange={e => setHeaderRows(p => p.map((r, j) => j === i ? { ...r, key: e.target.value } : r))} placeholder="Key" style={{ ...inputStyle, flex: 1 }} />
                  <input value={row.value} onChange={e => setHeaderRows(p => p.map((r, j) => j === i ? { ...r, value: e.target.value } : r))} placeholder="Value" style={{ ...inputStyle, flex: 1 }} />
                  {i > 0 && <button onClick={() => setHeaderRows(p => p.filter((_, j) => j !== i))} style={{ background: 'none', border: 'none', color: 'var(--accent-red)', fontSize: '16px' }}>×</button>}
                </div>
              ))}
            </div>

            {/* Payload */}
            {['POST', 'PUT', 'PATCH'].includes(form.method) && (
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>REQUEST BODY (JSON)</label>
                <textarea value={form.payload} onChange={e => set('payload', e.target.value)} rows={6} placeholder='{"key": "value"}' style={{ ...inputStyle, resize: 'vertical', lineHeight: '1.5' }}
                  onFocus={e => e.target.style.borderColor = 'var(--accent-green)'}
                  onBlur={e => e.target.style.borderColor = 'var(--border)'}
                />
              </div>
            )}

            {/* Expected Status + Description */}
            <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
              <div style={{ flex: 1 }}>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>EXPECTED STATUS</label>
                <input type="number" value={form.expectedStatusCode} onChange={e => set('expectedStatusCode', parseInt(e.target.value))} style={inputStyle} />
              </div>
              <div style={{ flex: 2 }}>
                <label style={{ display: 'block', fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '6px' }}>DESCRIPTION</label>
                <input value={form.description} onChange={e => set('description', e.target.value)} placeholder="What does this API do?" style={inputStyle} />
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button onClick={runTest} disabled={loading.run || !form.endpoint} style={{
                flex: 1, padding: '12px', background: 'var(--accent-green-dim)', border: '1px solid var(--accent-green)',
                borderRadius: 'var(--radius)', color: 'var(--accent-green)', fontSize: '12px', letterSpacing: '1.5px',
                opacity: !form.endpoint ? 0.5 : 1,
              }}>
                {loading.run ? '⟳ RUNNING...' : '▶ RUN TEST'}
              </button>
            </div>

            <div style={{ display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' }}>
              {[
                { key: 'restassured', label: 'RESTASSURED', color: 'var(--accent-blue)' },
                { key: 'gatling', label: 'GATLING', color: 'var(--accent-purple)' },
                { key: 'postman', label: 'POSTMAN', color: 'var(--accent-yellow)' },
              ].map(({ key, label, color }) => (
                <button key={key} onClick={() => generate(key)} disabled={loading[key] || !form.endpoint} style={{
                  flex: 1, padding: '10px 8px', background: 'var(--bg-secondary)', border: `1px solid ${color}`,
                  borderRadius: 'var(--radius)', color, fontSize: '10px', letterSpacing: '1px',
                  opacity: !form.endpoint ? 0.5 : 1,
                }}>
                  {loading[key] ? '⟳' : '+'} {label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Right - Results / Code */}
        <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 'var(--radius-lg)' }}>
          <div style={{ display: 'flex', borderBottom: '1px solid var(--border)', padding: '0 16px' }}>
            <Tab label="RESULT" active={tab === 'result'} onClick={() => setTab('result')} />
            <Tab label="GENERATED CODE" active={tab === 'code'} onClick={() => setTab('code')} color="var(--accent-blue)" />
          </div>

          <div style={{ padding: '20px' }}>
            {tab === 'result' && (
              result ? (
                <div style={{ animation: 'fadeIn 0.3s ease' }}>
                  {/* Result Header */}
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '20px', flexWrap: 'wrap' }}>
                    {[
                      { label: 'STATUS', value: result.result?.statusCode, color: result.result?.statusCode >= 400 ? 'var(--accent-red)' : 'var(--accent-green)' },
                      { label: 'TIME', value: `${result.result?.responseTimeMs}ms`, color: 'var(--accent-blue)' },
                      { label: 'RESULT', value: result.result?.passed ? 'PASS' : 'FAIL', color: result.result?.passed ? 'var(--accent-green)' : 'var(--accent-red)' },
                    ].map(item => (
                      <div key={item.label} style={{ flex: 1, padding: '12px', background: 'var(--bg-secondary)', borderRadius: 'var(--radius)', textAlign: 'center' }}>
                        <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '1px', marginBottom: '4px' }}>{item.label}</div>
                        <div style={{ fontFamily: 'var(--font-display)', fontSize: '20px', fontWeight: 700, color: item.color }}>{item.value}</div>
                      </div>
                    ))}
                  </div>

                  {result.result?.failureReason && (
                    <div style={{ padding: '12px', background: 'var(--accent-red-dim)', border: '1px solid var(--accent-red)', borderRadius: 'var(--radius)', color: 'var(--accent-red)', fontSize: '12px', marginBottom: '16px' }}>
                      {result.result.failureReason}
                    </div>
                  )}

                  <div style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '2px', marginBottom: '8px' }}>RESPONSE BODY</div>
                  <pre style={{ background: 'var(--bg-secondary)', border: '1px solid var(--border)', borderRadius: 'var(--radius)', padding: '16px', fontSize: '12px', overflow: 'auto', maxHeight: '300px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap' }}>
                    {(() => { try { return JSON.stringify(JSON.parse(result.result?.responseBody), null, 2); } catch { return result.result?.responseBody || 'No response body'; } })()}
                  </pre>
                </div>
              ) : (
                <div style={{ padding: '60px 0', textAlign: 'center', color: 'var(--text-muted)' }}>
                  <div style={{ fontSize: '32px', marginBottom: '12px' }}>▶</div>
                  <div style={{ fontSize: '12px', letterSpacing: '2px' }}>CONFIGURE AND RUN A TEST</div>
                </div>
              )
            )}

            {tab === 'code' && (
              <div style={{ animation: 'fadeIn 0.3s ease' }}>
                <div style={{ display: 'flex', gap: '0', marginBottom: '16px', borderBottom: '1px solid var(--border)' }}>
                  {[
                    { key: 'restassured', label: 'RestAssured', color: 'var(--accent-blue)' },
                    { key: 'gatling', label: 'Gatling', color: 'var(--accent-purple)' },
                    { key: 'postman', label: 'Postman', color: 'var(--accent-yellow)' },
                  ].map(({ key, label, color }) => (
                    <Tab key={key} label={label} active={codeTab === key} onClick={() => setCodeTab(key)} color={color} />
                  ))}
                </div>
                <CodeBlock code={codes[codeTab]} language={codeTab} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}