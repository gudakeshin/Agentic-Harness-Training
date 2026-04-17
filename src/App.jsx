import React, { useState } from 'react';
import { 
  Shield, Brain, Database, Server, User, AlertTriangle, 
  CheckCircle, XCircle, Lock, Train, Zap, Cpu, ArrowRight,
  GitCommit, Activity, FileText, Layers, Scale, ListChecks, Network, Cloud,
  TerminalSquare, ShieldAlert, EyeOff, FileCode, Workflow,
  ChevronLeft, Play, Terminal, Code, Bug, CheckSquare, StopCircle, Sparkles, Loader2, Video
} from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('imperative');

  // State for Sandbox Exercise
  const [policyCode, setPolicyCode] = useState(`{
  "policy_name": "auto_sweep_limits",
  "resource": "execute_sweep",
  "rules": {
    "max_amount_usd": 25000,
    "allowed_currencies": ["USD", "EUR"],
    "require_same_entity": true
  }
}`);
  const [sandboxOutput, setSandboxOutput] = useState(null);
  const [isSimulating, setIsSimulating] = useState(false);

  // Gemini API States
  const [policyPrompt, setPolicyPrompt] = useState('');
  const [isGeneratingPolicy, setIsGeneratingPolicy] = useState(false);
  const [isExplaining, setIsExplaining] = useState(false);
  const [explanation, setExplanation] = useState('');

  // State for Canvas Exercise
  const [canvasStep, setCanvasStep] = useState(0);

  // Gemini API Helper
  const callGemini = async (prompt, isJson = false) => {
    const apiKey = ""; // API key is injected by the environment
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${apiKey}`;

    const payload = {
      contents: [{ parts: [{ text: prompt }] }],
      systemInstruction: { 
        parts: [{ text: "You are a senior AI solutions architect for finance. Provide concise, professional, and accurate responses." }] 
      }
    };

    if (isJson) {
      payload.generationConfig = { responseMimeType: "application/json" };
    }

    let retries = 0;
    const maxRetries = 5;
    const delays = [1000, 2000, 4000, 8000, 16000];

    while (retries < maxRetries) {
      try {
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });

        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        const data = await response.json();
        return data.candidates?.[0]?.content?.parts?.[0]?.text || "";
      } catch (error) {
        if (retries === maxRetries - 1) {
          console.error("Gemini API failed after retries:", error);
          return isJson ? "{}" : "Error: Unable to connect to the AI service. Please try again.";
        }
        await new Promise(res => setTimeout(res, delays[retries]));
        retries++;
      }
    }
  };

  const handleGeneratePolicy = async () => {
    if (!policyPrompt.trim()) return;
    setIsGeneratingPolicy(true);
    const prompt = `Create a strict JSON policy for a financial guardrail node. 
    The current resource being protected is 'execute_sweep'. 
    The user's natural language rule is: "${policyPrompt}". 
    Format it exactly matching this schema: {"policy_name": "string", "resource": "string", "rules": { ...key-value rules... }}. 
    Respond ONLY with the raw JSON object, no markdown formatting.`;
    
    const result = await callGemini(prompt, true);
    if (result) {
      // Clean up markdown block if model ignored the directive
      const cleanResult = result.replace(/^```json\n?/, '').replace(/```\n?$/, '').trim();
      setPolicyCode(cleanResult);
    }
    setIsGeneratingPolicy(false);
  };

  const handleExplainBreach = async () => {
    setIsExplaining(true);
    const prompt = `Explain this AI guardrail breach error log in 2-3 simple, professional sentences for a non-technical Finance Controller. Explicitly state the financial risk that was mitigated by the guardrail:\n\n${sandboxOutput}`;
    const result = await callGemini(prompt);
    setExplanation(result);
    setIsExplaining(false);
  };

  const runSandboxSimulation = () => {
    setIsSimulating(true);
    setSandboxOutput(null);
    setExplanation('');
    
    setTimeout(() => {
      setSandboxOutput(`{
  "status": "BLOCKED",
  "error_code": "EVAL_THRESHOLD_EXCEEDED",
  "message": "Tool execution rejected by Guardrail Node.",
  "details": {
    "attempted_amount": 30000,
    "max_allowed": 25000,
    "variance": 5000
  },
  "action_required": "Route to human controller for asynchronous approval.",
  "checkpoint_id": "chk_98x12z_blocked"
}`);
      setIsSimulating(false);
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-300 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-950/80 backdrop-blur-md border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg shadow-lg shadow-purple-900/20">
              <Shield className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-white to-slate-400 bg-clip-text text-transparent">
                Architecting Guardrails
              </h1>
              <p className="text-xs text-blue-400 font-medium tracking-wide uppercase">The 2026 Agentic AI Harness</p>
            </div>
          </div>
          <div className="hidden md:flex space-x-1">
            {['imperative', 'engine', 'landscape', 'governance', 'anatomy', 'exercises'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                  activeTab === tab 
                    ? 'bg-blue-600/10 text-blue-400 border border-blue-500/30' 
                    : 'text-slate-400 hover:text-white hover:bg-slate-800/50'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Tab Content: Imperative */}
        {activeTab === 'imperative' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">
                Why the <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500">Harness</span> Matters
              </h2>
              <p className="text-lg text-slate-400 leading-relaxed">
                The transition from RPA to Agentic AI introduces a critical variable: autonomy. 
                Without a rigid harness, autonomy in finance is a liability.
              </p>
            </div>

            {/* RPA vs AI Comparison */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Train className="w-32 h-32 text-blue-400" />
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-blue-500/20 rounded-xl text-blue-400">
                    <Activity className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Traditional RPA</h3>
                </div>
                <div className="h-2 w-full bg-slate-800 rounded-full mb-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 h-full w-1/2 bg-blue-500 rounded-full"></div>
                </div>
                <p className="text-slate-300 font-medium mb-4">Rules-Based & Predictable</p>
                <p className="text-slate-500 text-sm">Moves reliably from Point A to Point B. Rigid, highly predictable, but breaks immediately when exceptions occur.</p>
              </div>

              <div className="bg-slate-900/50 border border-red-900/30 rounded-2xl p-8 relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                  <Zap className="w-32 h-32 text-red-500" />
                </div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-red-500/20 rounded-xl text-red-400 animate-pulse">
                    <AlertTriangle className="w-6 h-6" />
                  </div>
                  <h3 className="text-2xl font-bold text-white">Unharnessed Agentic AI</h3>
                </div>
                <div className="mb-6 flex space-x-2">
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-red-400 border border-red-500/20">Regulatory Hallucinations</span>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-500/10 text-orange-400 border border-orange-500/20">Unauthorized Writes</span>
                </div>
                <p className="text-slate-300 font-medium mb-4">Autonomous & Unpredictable</p>
                <p className="text-slate-500 text-sm">Like an off-road vehicle in a foggy forest. Highly adaptable, but prone to broken audit trails and executing unauthorized commands.</p>
              </div>
            </div>

            {/* Role Matrix */}
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-white mb-8 text-center">The Evolution of the Finance Professional</h3>
              <div className="grid md:grid-cols-2 gap-px bg-slate-800 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
                <div className="bg-slate-900 p-10 flex flex-col items-center text-center">
                  <div className="flex space-x-4 mb-6 text-slate-600 grayscale">
                    <FileText className="w-8 h-8" />
                    <Database className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-slate-400 mb-2">2020s: Manual Data Processor</h4>
                  <p className="text-slate-500 text-sm italic mb-4">"Doing the work"</p>
                  <p className="text-slate-400 text-sm">Reconciling line items, copying data between portals, manual data entry.</p>
                </div>
                <div className="bg-slate-900 p-10 flex flex-col items-center text-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-600/5 to-purple-600/5"></div>
                  <div className="flex space-x-4 mb-6 text-blue-400 relative z-10">
                    <Cpu className="w-8 h-8" />
                    <Shield className="w-8 h-8" />
                  </div>
                  <h4 className="text-xl font-bold text-white mb-2 relative z-10">2026: AI Orchestrator & Governor</h4>
                  <p className="text-blue-400 text-sm italic mb-4 relative z-10">"Governing the work"</p>
                  <p className="text-slate-300 text-sm relative z-10">Defining system access, auditing AI reasoning paths, setting deterministic variance thresholds.</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Engine */}
        {activeTab === 'engine' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-3xl mx-auto mb-16">
              <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Under the Hood: <span className="text-blue-400">Core Components</span></h2>
              <p className="text-lg text-slate-400">Treat the AI Harness like a mechanical engine block. These four glowing layers constrain and control the autonomous agent.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* Orchestrator */}
              <div className="bg-slate-900 border-t-4 border-t-purple-500 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 bg-purple-500/10 rounded-full p-12 blur-2xl"></div>
                <Brain className="w-10 h-10 text-purple-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">1. The Orchestrator</h3>
                <p className="text-purple-400 text-sm font-medium mb-6">e.g., LangGraph (The Brain)</p>
                <div className="space-y-4 text-sm text-slate-400">
                  <p><strong className="text-slate-200">What it does:</strong> Dictates step-by-step logic, looping, and routing of tasks based on predefined graphs.</p>
                  <p><strong className="text-slate-200">Finance Importance:</strong> Ensures deterministic workflows. Prevents the AI from skipping mandatory compliance steps (e.g., must pull statements before querying ledger).</p>
                </div>
              </div>

              {/* Memory */}
              <div className="bg-slate-900 border-t-4 border-t-orange-500 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 bg-orange-500/10 rounded-full p-12 blur-2xl"></div>
                <Database className="w-10 h-10 text-orange-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">2. State & Memory</h3>
                <p className="text-orange-400 text-sm font-medium mb-6">Checkpointing (The Ledger)</p>
                <div className="space-y-4 text-sm text-slate-400">
                  <p><strong className="text-slate-200">What it does:</strong> Records every thought, API call, response, and decision point, constantly saving the state.</p>
                  <p><strong className="text-slate-200">Finance Importance:</strong> 100% auditability. Allows controllers to replay the exact deterministic thought process of the agent for SOX compliance.</p>
                </div>
              </div>

              {/* Registry */}
              <div className="bg-slate-900 border-t-4 border-t-blue-500 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 bg-blue-500/10 rounded-full p-12 blur-2xl"></div>
                <Server className="w-10 h-10 text-blue-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">3. Tool Registry</h3>
                <p className="text-blue-400 text-sm font-medium mb-6">Access Broker (The Gateway)</p>
                <div className="space-y-4 text-sm text-slate-400">
                  <p><strong className="text-slate-200">What it does:</strong> Defines the limited list of external systems the agent can touch and specific methods permitted.</p>
                  <p><strong className="text-slate-200">Finance Importance:</strong> Enforces <em>Least-Privilege Access</em>. Ensures an agent can READ an invoice but fundamentally lacks the POST tool to write a journal entry.</p>
                </div>
              </div>

              {/* Guardrail */}
              <div className="bg-slate-900 border-t-4 border-t-red-500 rounded-xl p-8 shadow-2xl relative overflow-hidden">
                <div className="absolute -right-6 -top-6 bg-red-500/10 rounded-full p-12 blur-2xl"></div>
                <Shield className="w-10 h-10 text-red-400 mb-6" />
                <h3 className="text-2xl font-bold text-white mb-2">4. The Evaluator</h3>
                <p className="text-red-400 text-sm font-medium mb-6">Guardrail Node (The Shield)</p>
                <div className="space-y-4 text-sm text-slate-400">
                  <p><strong className="text-slate-200">What it does:</strong> Validates proposed actions against hard-coded business logic <em>before</em> hitting external systems.</p>
                  <p><strong className="text-slate-200">Finance Importance:</strong> The ultimate safety net. Blocks actions that violate thresholds (e.g., stopping an auto-post if a variance &gt; $50.00).</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Landscape */}
        {activeTab === 'landscape' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">The 2026 <span className="text-blue-400">Harness Landscape</span></h2>
              <p className="text-lg text-slate-400">Comparing enterprise-grade orchestration frameworks and how finance leaders must evaluate their architectural trade-offs.</p>
            </div>

            {/* Harness Comparison Grid */}
            <div className="grid md:grid-cols-3 gap-6">
              {/* LangGraph */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative hover:border-purple-500/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-purple-500 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-purple-500/10 rounded-lg"><Network className="w-6 h-6 text-purple-400" /></div>
                  <span className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded border border-slate-700">Open-Source Core</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">LangGraph / LlamaIndex</h3>
                <p className="text-sm text-slate-400 mb-6 min-h-[60px]">Highly flexible, graph-based state machines. Excellent for custom workflows but requires heavy engineering to secure.</p>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">State / Memory Layer</p>
                    <p className="text-xs text-slate-300">Bring-your-own DB (Postgres/Redis). Granular but manual audit trail setup.</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tool Registry Layer</p>
                    <p className="text-xs text-slate-300">API key driven. Requires custom middleware for Entra ID / OAuth2.0 tool gating.</p>
                  </div>
                </div>
              </div>

              {/* Semantic Kernel */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative hover:border-blue-500/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-blue-500 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-blue-500/10 rounded-lg"><Cloud className="w-6 h-6 text-blue-400" /></div>
                  <span className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded border border-slate-700">Managed / Enterprise</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Semantic Kernel (MSFT)</h3>
                <p className="text-sm text-slate-400 mb-6 min-h-[60px]">Deeply integrated with Azure & M365. Native enterprise identity, but architectural patterns are more rigid.</p>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">State / Memory Layer</p>
                    <p className="text-xs text-slate-300">Native Azure Cosmos integration. Excellent compliance tracking out-of-the-box.</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tool Registry Layer</p>
                    <p className="text-xs text-slate-300">Entra ID (Active Directory) native. Tools inherit the exact permissions of the executing user.</p>
                  </div>
                </div>
              </div>

              {/* NemoClaw / NeMo */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative hover:border-emerald-500/50 transition-all group">
                <div className="absolute top-0 left-0 w-full h-1 bg-emerald-500 rounded-t-2xl opacity-50 group-hover:opacity-100 transition-opacity"></div>
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 bg-emerald-500/10 rounded-lg"><Cpu className="w-6 h-6 text-emerald-400" /></div>
                  <span className="px-2 py-1 bg-slate-800 text-xs text-slate-300 rounded border border-slate-700">Hardware / Air-Gapped</span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">NVIDIA NeMo / NemoClaw</h3>
                <p className="text-sm text-slate-400 mb-6 min-h-[60px]">Built for privacy-first, on-premise execution. Uses hardware-level sandboxing for sensitive financial data.</p>
                <div className="space-y-3">
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">State / Memory Layer</p>
                    <p className="text-xs text-slate-300">Zero-trust memory enclaves. Data never leaves the VPC; immune to external telemetry.</p>
                  </div>
                  <div className="bg-slate-950 p-3 rounded border border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-bold mb-1">Tool Registry Layer</p>
                    <p className="text-xs text-slate-300">Privacy Routers scrub PII/financials before hitting internal APIs. Strict protocol limits.</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Controller's Evaluation Framework */}
            <div className="bg-slate-800 border border-slate-700 rounded-2xl overflow-hidden shadow-2xl">
              <div className="bg-slate-900 px-8 py-6 border-b border-slate-700 flex items-center justify-between">
                <div>
                  <h3 className="text-2xl font-bold text-white flex items-center">
                    <Scale className="w-6 h-6 text-blue-400 mr-3" />
                    The Finance Controller's Evaluation Framework
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">How to vet an Agentic Harness before granting ERP access.</p>
                </div>
                <ListChecks className="w-10 h-10 text-slate-600 opacity-50 hidden sm:block" />
              </div>
              <div className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  {/* Criteria 1 */}
                  <div className="flex gap-4">
                    <div className="mt-1"><div className="w-8 h-8 rounded-full bg-blue-900/50 flex items-center justify-center text-blue-400 font-bold border border-blue-800">1</div></div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-200 mb-2">State Auditability (The "SOX" Test)</h4>
                      <p className="text-sm text-slate-400 mb-3">If the agent makes a $5M error, can you query its memory like a SQL database to prove exactly which API response triggered the decision?</p>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                        <strong className="text-red-400">Red Flag:</strong> The framework only logs final outputs, hiding the intermediate "thought" steps and tool retries.
                      </div>
                    </div>
                  </div>

                  {/* Criteria 2 */}
                  <div className="flex gap-4">
                    <div className="mt-1"><div className="w-8 h-8 rounded-full bg-purple-900/50 flex items-center justify-center text-purple-400 font-bold border border-purple-800">2</div></div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-200 mb-2">Deterministic Routing</h4>
                      <p className="text-sm text-slate-400 mb-3">Can you force the agent to follow a strict Standard Operating Procedure (SOP) before it is allowed to use LLM autonomy?</p>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                        <strong className="text-emerald-400">Green Flag:</strong> The harness supports rigid edge-routing (e.g., Node A *must* route to Node B before engaging the LLM for analysis).
                      </div>
                    </div>
                  </div>

                  {/* Criteria 3 */}
                  <div className="flex gap-4">
                    <div className="mt-1"><div className="w-8 h-8 rounded-full bg-orange-900/50 flex items-center justify-center text-orange-400 font-bold border border-orange-800">3</div></div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-200 mb-2">Identity & Tool Propagation</h4>
                      <p className="text-sm text-slate-400 mb-3">Does the agent authenticate to systems using a generic "Service Account," or does it pass through the Entra ID/SSO token of the human who triggered it?</p>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                        <strong className="text-red-400">Red Flag:</strong> Tools rely on static, globally-scoped API keys, breaking the principle of least privilege.
                      </div>
                    </div>
                  </div>

                  {/* Criteria 4 */}
                  <div className="flex gap-4">
                    <div className="mt-1"><div className="w-8 h-8 rounded-full bg-emerald-900/50 flex items-center justify-center text-emerald-400 font-bold border border-emerald-800">4</div></div>
                    <div>
                      <h4 className="text-lg font-bold text-slate-200 mb-2">Human-in-the-Loop (HITL) Granularity</h4>
                      <p className="text-sm text-slate-400 mb-3">Can you set conditional breakpoints? (e.g., pause execution ONLY if the vendor is international OR the amount is &gt; $10k).</p>
                      <div className="bg-slate-900 p-3 rounded-lg border border-slate-700 text-xs text-slate-300">
                        <strong className="text-emerald-400">Green Flag:</strong> The framework allows state serialization (saving the job to disk) while waiting asynchronously for a human click.
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Governance */}
        {activeTab === 'governance' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">The 2026 Governance Paradigm</h2>
              <p className="text-lg text-slate-400">Understanding how modern AI platforms segment risk and enforce Least-Privilege Access computationally.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-12 items-center">
              {/* Anthropic Model */}
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 relative flex flex-col items-center justify-center min-h-[400px]">
                <h3 className="text-xl font-bold text-white mb-8 absolute top-8 left-8">Anthropic's Four-Layer Model</h3>
                
                {/* Concentric Circles Visual */}
                <div className="relative w-64 h-64 flex items-center justify-center">
                  {/* Environment */}
                  <div className="absolute inset-0 border-2 border-emerald-500/30 rounded-full animate-[spin_20s_linear_infinite]"></div>
                  <div className="absolute inset-2 border border-emerald-500/20 rounded-full"></div>
                  
                  {/* Tools */}
                  <div className="absolute inset-8 border-2 border-orange-500/40 rounded-full bg-slate-900"></div>
                  
                  {/* Harness */}
                  <div className="absolute inset-16 border-2 border-blue-500/50 rounded-full bg-slate-800"></div>
                  
                  {/* The Padlock */}
                  <div className="absolute z-20 left-1/2 -translate-x-1/2 top-10 bg-red-500 p-2 rounded-full shadow-lg shadow-red-500/30 border-2 border-slate-900">
                    <Lock className="w-4 h-4 text-white" />
                  </div>

                  {/* Model Center */}
                  <div className="absolute inset-24 bg-slate-700 rounded-full flex items-center justify-center border border-slate-600 shadow-inner">
                    <Cpu className="w-8 h-8 text-slate-300" />
                  </div>
                </div>

                <div className="mt-8 space-y-2 text-sm">
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-emerald-500"></span><span className="text-slate-300">Environment (ERP/CRM)</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-orange-500"></span><span className="text-slate-300">Tools (APIs)</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-blue-500"></span><span className="text-slate-300">Harness (LangGraph)</span></div>
                  <div className="flex items-center space-x-2"><span className="w-3 h-3 rounded-full bg-slate-500"></span><span className="text-slate-300">Model (LLM Base)</span></div>
                </div>
                <p className="mt-6 text-xs text-red-400 bg-red-500/10 p-3 rounded-lg text-center border border-red-500/20">
                  <Lock className="w-3 h-3 inline mr-1" /> Finance Controllers own the boundary between Harness & Tools.
                </p>
              </div>

              {/* ID Badge */}
              <div className="flex justify-center">
                <div className="w-80 bg-slate-800 rounded-2xl overflow-hidden shadow-[0_0_50px_-12px_rgba(59,130,246,0.3)] border border-slate-700 transform rotate-2 hover:rotate-0 transition-transform duration-300">
                  {/* Lanyard Hole */}
                  <div className="w-full h-8 bg-slate-900 flex justify-center items-center border-b border-slate-700">
                    <div className="w-12 h-2 rounded-full bg-slate-950 border border-slate-700 shadow-inner"></div>
                  </div>
                  
                  <div className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div>
                        <p className="text-[10px] font-bold text-blue-400 uppercase tracking-wider mb-1">Enterprise Agent Persona</p>
                        <h4 className="text-xl font-bold text-white leading-tight">AP-Recon<br/>Agent-01</h4>
                        <p className="text-xs text-slate-400 mt-1">Accounts Payable Reconciler</p>
                      </div>
                      <div className="w-12 h-12 bg-blue-500/20 rounded-xl border border-blue-500/30 flex items-center justify-center">
                        <Cpu className="w-6 h-6 text-blue-400" />
                      </div>
                    </div>

                    <div className="space-y-4">
                      <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-700/50">
                        <p className="text-[10px] text-slate-500 font-bold uppercase mb-2">Approved Tools</p>
                        <ul className="space-y-2 text-sm text-slate-300 font-mono">
                          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2" /> query_invoice_db</li>
                          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2" /> read_po_lines</li>
                          <li className="flex items-center"><CheckCircle className="w-4 h-4 text-emerald-500 mr-2" /> calc_variance</li>
                        </ul>
                      </div>

                      <div className="bg-red-950/20 rounded-lg p-3 border border-red-900/30">
                        <p className="text-[10px] text-red-500/70 font-bold uppercase mb-2">Blocked / Unregistered</p>
                        <ul className="space-y-2 text-sm text-slate-400 font-mono">
                          <li className="flex items-center"><XCircle className="w-4 h-4 text-red-500 mr-2 opacity-70" /> post_journal_entry</li>
                          <li className="flex items-center"><XCircle className="w-4 h-4 text-red-500 mr-2 opacity-70" /> modify_vendor_bank</li>
                          <li className="flex items-center"><XCircle className="w-4 h-4 text-red-500 mr-2 opacity-70" /> approve_payment</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div className="h-2 w-full bg-gradient-to-r from-blue-500 to-purple-600"></div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Anatomy & Examples */}
        {activeTab === 'anatomy' && (
          <div className="space-y-16 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-3xl mx-auto">
              <h2 className="text-4xl font-extrabold text-white mb-6 tracking-tight">Enterprise Architecture <span className="text-purple-400">Deep Dive</span></h2>
              <p className="text-lg text-slate-400">
                How should a finance controller think about AI architecture? By applying traditional risk concepts—<strong>Segregation of Duties</strong> and <strong>Data Residency</strong>—to the machine layer.
              </p>
            </div>

            <div className="space-y-8">
              {/* Open-Source / Baseline Architecture */}
              <div className="bg-slate-900/50 border border-red-900/30 rounded-2xl overflow-hidden shadow-2xl relative">
                <div className="absolute top-0 left-0 w-1 bg-red-500 h-full"></div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <Network className="text-red-400 mr-3" /> Standard "OpenClaw" Architecture
                      </h3>
                      <p className="text-slate-400 mt-2 text-sm">Typical baseline used in POCs and open-source deployments.</p>
                    </div>
                    <div className="px-3 py-1 bg-red-500/10 border border-red-500/20 text-red-400 rounded text-xs font-bold uppercase tracking-wider">
                      Fails Audit / High Risk
                    </div>
                  </div>

                  {/* Visual Flow: OpenClaw */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-6 mb-8 flex items-center justify-between relative">
                    <div className="absolute inset-0 bg-red-500/5 bg-[radial-gradient(#ef4444_1px,transparent_1px)] [background-size:16px_16px] opacity-20"></div>
                    
                    <div className="relative z-10 w-1/4 bg-slate-800 border border-slate-700 p-4 rounded-lg text-center">
                      <Brain className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">LLM Brain</p>
                      <p className="text-[10px] text-slate-400">Generates API Payload</p>
                    </div>

                    <div className="relative z-10 flex-1 flex flex-col items-center px-4">
                      <div className="w-full h-1 bg-red-500/50 relative">
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-slate-950 px-2 flex items-center space-x-1">
                          <ShieldAlert className="w-4 h-4 text-red-500" />
                          <span className="text-[10px] text-red-400 font-mono">Direct Execution (No Sandbox)</span>
                        </div>
                      </div>
                      <ArrowRight className="text-red-500 mt-2" />
                    </div>

                    <div className="relative z-10 w-1/4 bg-slate-800 border border-red-900/50 p-4 rounded-lg text-center shadow-[0_0_15px_rgba(239,68,68,0.2)]">
                      <Database className="w-8 h-8 text-red-400 mx-auto mb-2" />
                      <p className="text-sm font-bold text-white">Production ERP</p>
                      <p className="text-[10px] text-red-300">Raw Data Exposed</p>
                    </div>
                  </div>

                  {/* Controller's Perspective */}
                  <div className="grid md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-xl border border-slate-800/50">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">The Technical Flaw</h4>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-start"><XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" /> The LLM acts as both the "Brain" and the "Executioner".</li>
                        <li className="flex items-start"><XCircle className="w-4 h-4 text-red-400 mr-2 mt-0.5 flex-shrink-0" /> No data masking: Real account numbers are sent to third-party model providers.</li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">The Finance & Risk View</h4>
                      <ul className="space-y-2 text-sm text-slate-400">
                        <li className="flex items-start"><AlertTriangle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" /> <strong>Segregation of Duties Failure:</strong> The entity generating the journal entry is the same entity posting it.</li>
                        <li className="flex items-start"><AlertTriangle className="w-4 h-4 text-orange-400 mr-2 mt-0.5 flex-shrink-0" /> <strong>Material Misstatement Risk:</strong> If the model hallucinates a decimal shift, it hits the general ledger instantly.</li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>

              {/* Enterprise / NemoClaw Architecture */}
              <div className="bg-slate-900/80 border border-blue-900/50 rounded-2xl overflow-hidden shadow-[0_0_30px_rgba(59,130,246,0.15)] relative">
                <div className="absolute top-0 left-0 w-1 bg-gradient-to-b from-blue-500 to-purple-600 h-full"></div>
                <div className="p-8">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h3 className="text-2xl font-bold text-white flex items-center">
                        <Cpu className="text-blue-400 mr-3" /> Enterprise "NemoClaw" Architecture
                      </h3>
                      <p className="text-slate-400 mt-2 text-sm">Air-gapped, sandboxed, and computationally segregated.</p>
                    </div>
                    <div className="px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded text-xs font-bold uppercase tracking-wider flex items-center">
                      <CheckCircle className="w-3 h-3 mr-1" /> SOC 2 / SOX Ready
                    </div>
                  </div>

                  {/* Visual Flow: Enterprise */}
                  <div className="bg-slate-950 rounded-xl border border-slate-800 p-8 mb-8 relative">
                    <div className="grid grid-cols-5 gap-4 relative z-10 items-center">
                      
                      {/* Step 1 */}
                      <div className="col-span-1 flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 border border-slate-600 flex items-center justify-center mb-3 group-hover:border-blue-400 transition-colors">
                          <User className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-white">Agent Request</p>
                        <p className="text-[9px] text-slate-500 mt-1">"Reconcile Account 4010"</p>
                      </div>

                      {/* Path 1 */}
                      <div className="col-span-1 flex items-center justify-center relative">
                        <div className="w-full h-0.5 bg-slate-700"></div>
                        <div className="absolute bg-slate-900 border border-purple-500/50 p-2 rounded-lg shadow-lg flex flex-col items-center">
                          <EyeOff className="w-4 h-4 text-purple-400 mb-1" />
                          <span className="text-[8px] font-bold text-purple-300">Privacy Router</span>
                          <span className="text-[7px] text-slate-400 leading-tight mt-1 text-center">Masks PII/Financials<br/>before LLM</span>
                        </div>
                      </div>

                      {/* Step 2 */}
                      <div className="col-span-1 flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-2xl bg-blue-900/20 border border-blue-500/30 flex items-center justify-center mb-3">
                          <Brain className="w-8 h-8 text-blue-400" />
                        </div>
                        <p className="text-xs font-bold text-white">LLM Processing</p>
                        <p className="text-[9px] text-slate-500 mt-1">Generates Python/API Code</p>
                      </div>

                      {/* Path 2 */}
                      <div className="col-span-1 flex items-center justify-center relative">
                        <div className="w-full h-0.5 bg-slate-700"></div>
                        <div className="absolute bg-slate-900 border border-emerald-500/50 p-2 rounded-lg shadow-lg flex flex-col items-center">
                          <Shield className="w-4 h-4 text-emerald-400 mb-1" />
                          <span className="text-[8px] font-bold text-emerald-300">Semantic Firewall</span>
                          <span className="text-[7px] text-slate-400 leading-tight mt-1 text-center">Checks limits (e.g. &lt; $50k)</span>
                        </div>
                      </div>

                      {/* Step 3 */}
                      <div className="col-span-1 flex flex-col items-center text-center group">
                        <div className="w-16 h-16 rounded-2xl bg-slate-800 border-2 border-dashed border-slate-500 flex items-center justify-center mb-3 relative overflow-hidden">
                          <div className="absolute inset-0 bg-blue-500/10"></div>
                          <TerminalSquare className="w-8 h-8 text-slate-300" />
                        </div>
                        <p className="text-xs font-bold text-white relative">
                          OpenShell Sandbox
                          <span className="absolute -top-1 -right-2 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-blue-500"></span>
                          </span>
                        </p>
                        <p className="text-[9px] text-slate-500 mt-1">Executes in Isolation</p>
                      </div>

                    </div>
                  </div>

                  {/* Controller's Perspective */}
                  <div className="grid md:grid-cols-2 gap-6 bg-slate-950/50 p-6 rounded-xl border border-slate-800/50">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">The Technical Defense</h4>
                      <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start">
                          <Lock className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" /> 
                          <div><strong className="text-slate-300">Privacy Routing:</strong> Intercepts prompts outbound to the LLM. Replaces real vendor IDs and amounts with tokens (e.g., <code>[VENDOR_A]</code>).</div>
                        </li>
                        <li className="flex items-start">
                          <FileCode className="w-4 h-4 text-blue-400 mr-2 mt-0.5 flex-shrink-0" /> 
                          <div><strong className="text-slate-300">OpenShell Sandboxing:</strong> Code generated by the AI is executed in an ephemeral, containerized environment. It never touches the ERP directly.</div>
                        </li>
                      </ul>
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3 border-b border-slate-800 pb-2">The Finance & Risk View</h4>
                      <ul className="space-y-3 text-sm text-slate-400">
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" /> 
                          <div><strong className="text-slate-300">Data Residency Solved:</strong> Because of the Privacy Router, no regulated financial data ever leaves your VPC (Virtual Private Cloud).</div>
                        </li>
                        <li className="flex items-start">
                          <CheckCircle className="w-4 h-4 text-emerald-400 mr-2 mt-0.5 flex-shrink-0" /> 
                          <div><strong className="text-slate-300">Machine-Level SOD:</strong> The LLM <em>suggests</em> the API payload, but the Semantic Firewall <em>approves</em> it based on deterministic thresholds, establishing true segregation.</div>
                        </li>
                      </ul>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Exception Map / HITL Swimlane (Updated for context) */}
            <div className="mt-16 border-t border-slate-800 pt-16">
              <div className="mb-8">
                <h3 className="text-2xl font-bold text-white mb-2 flex items-center">
                  <Workflow className="w-6 h-6 text-orange-400 mr-3" />
                  The Fallback: Human-in-the-Loop (HITL) Intercepts
                </h3>
                <p className="text-sm text-slate-400 max-w-3xl">
                  When the Semantic Firewall detects an anomaly or threshold breach, the process must gracefully pause. The system serializes the agent's memory state to disk, halting computation until a Finance Controller provides an asynchronous cryptographic approval.
                </p>
              </div>
              
              <div className="bg-slate-900 rounded-2xl border border-slate-800 p-6 overflow-x-auto shadow-xl">
                <div className="min-w-[800px]">
                  
                  {/* Lane 1: Agent */}
                  <div className="flex mb-4 relative">
                    <div className="w-48 flex-shrink-0 flex items-center font-bold text-blue-400 text-sm border-r border-slate-800 pr-4">
                      AI Agent (Sandboxed)
                    </div>
                    <div className="flex-1 flex items-center pl-8 space-x-4 relative">
                      <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-xs text-slate-300 flex items-center z-10">
                        Query Bank & Ledger
                      </div>
                      <div className="h-px bg-slate-700 w-8 z-0"></div>
                      <div className="bg-slate-800 border border-slate-700 px-4 py-2 rounded-lg text-xs text-slate-300 flex items-center z-10">
                        Identifies $200 Variance
                      </div>
                      <div className="h-px bg-slate-700 w-8 z-0"></div>
                      <div className="bg-blue-900/30 border border-blue-800 px-4 py-2 rounded-lg text-xs text-blue-300 flex items-center z-10 shadow-[0_0_10px_rgba(59,130,246,0.2)]">
                        Generate <code>auto_write_off</code>
                      </div>
                      
                      {/* Downward arrow to firewall */}
                      <svg className="absolute top-8 right-[180px] w-6 h-8 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                      </svg>
                    </div>
                  </div>

                  <div className="w-full h-px bg-slate-800 mb-4"></div>

                  {/* Lane 2: Firewall & Human */}
                  <div className="flex relative">
                    <div className="w-48 flex-shrink-0 flex items-center font-bold text-orange-400 text-sm border-r border-slate-800 pr-4">
                      Firewall & Controller
                    </div>
                    <div className="flex-1 flex items-center pl-8 space-x-4">
                      {/* Spacer to align under the tool attempt */}
                      <div className="w-[370px]"></div>
                      
                      <div className="bg-red-950/40 border border-red-900/50 px-4 py-3 rounded-lg text-xs z-10 flex flex-col items-center shadow-lg shadow-red-900/20">
                        <ShieldAlert className="w-4 h-4 text-red-400 mb-1" />
                        <span className="text-red-300 font-bold mb-1 tracking-wider">POLICY BREACH</span>
                        <span className="text-[10px] text-red-400/80 font-mono">variance &gt; $50.00</span>
                      </div>
                      
                      <div className="h-px bg-orange-500/50 w-8 z-0 dashed"></div>
                      
                      <div className="bg-orange-950/40 border border-orange-900/50 px-4 py-2 rounded-lg text-xs text-orange-300 flex items-center z-10 relative">
                        <span className="absolute -top-2 -right-2 text-[8px] bg-orange-600 text-white px-1 py-0.5 rounded">Paused</span>
                        <Database className="w-3 h-3 mr-2 text-orange-400" /> Serialize State DB
                      </div>

                      <div className="h-px bg-orange-500/50 w-8 z-0"></div>

                      <div className="bg-slate-800 border border-emerald-500/30 px-5 py-3 rounded-lg text-xs z-10 flex flex-col items-center shadow-[0_0_15px_rgba(16,185,129,0.1)]">
                        <User className="w-4 h-4 text-emerald-400 mb-1" />
                        <span className="text-emerald-300 font-bold mb-2">Controller Review</span>
                        <div className="flex space-x-2">
                          <button className="bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 px-3 py-1 rounded text-[10px] transition-colors font-medium">Approve</button>
                          <button className="bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-400 px-3 py-1 rounded text-[10px] transition-colors font-medium">Reject</button>
                        </div>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab Content: Exercises */}
        {activeTab === 'exercises' && (
          <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h2 className="text-4xl font-extrabold text-white mb-6">Scenario-Based <span className="text-emerald-400">Exercises</span></h2>
              <p className="text-lg text-slate-400">Apply governance concepts in your sandbox environment.</p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              {/* Exercise 1 */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 relative hover:border-blue-500/50 transition-colors">
                <div className="absolute top-0 right-0 bg-blue-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">Ex 1</div>
                <h3 className="text-xl font-bold text-white mb-4">Configuring the Guardrail Node</h3>
                
                <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-800">
                  <p className="text-sm text-slate-300"><strong className="text-blue-400">Scenario:</strong> Deploying an AI agent for daily cash positioning. Authorized to auto-sweep funds to cover deficits up to $25,000 maximum.</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-200">Your Tasks:</h4>
                  <ul className="space-y-3 text-sm text-slate-400 list-decimal pl-5">
                    <li>Define deterministic rules for the Evaluator Node.</li>
                    <li>What parameters must the Evaluator check <em>before</em> <code className="text-blue-300 bg-blue-900/30 px-1 rounded">execute_sweep</code> runs? (e.g., origin/destination ownership, amount, currency).</li>
                    <li>Draft the exact JSON failure message to return if it attempts a $30,000 sweep.</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => setActiveTab('sandbox-ex1')}
                  className="mt-8 w-full py-3 bg-blue-600 hover:bg-blue-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center group"
                >
                  Open Sandbox Environment <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>

              {/* Exercise 2 */}
              <div className="bg-slate-900 border border-slate-700 rounded-2xl p-8 relative hover:border-purple-500/50 transition-colors">
                <div className="absolute top-0 right-0 bg-purple-500 text-white text-xs font-bold px-3 py-1 rounded-bl-lg rounded-tr-xl">Ex 2</div>
                <h3 className="text-xl font-bold text-white mb-4">NemoClaw Sandbox Intercept</h3>
                
                <div className="bg-slate-950 rounded-lg p-4 mb-6 border border-slate-800">
                  <p className="text-sm text-slate-300"><strong className="text-purple-400">Scenario:</strong> Month-end close. Agent hallucinates a tool call to a public web-scraping API to find a hotel's daily rate (not in Tool Registry).</p>
                </div>

                <div className="space-y-4">
                  <h4 className="text-sm font-bold text-slate-200">Your Tasks:</h4>
                  <ul className="space-y-3 text-sm text-slate-400 list-decimal pl-5">
                    <li>Draw a flowchart of how NemoClaw handles this exception.</li>
                    <li>Visually map the request hitting the <strong>Tool Registry & Access Broker</strong>.</li>
                    <li>Illustrate how <strong>OpenShell</strong> blocks outbound traffic and logs the security event into State memory.</li>
                  </ul>
                </div>
                
                <button 
                  onClick={() => { setActiveTab('canvas-ex2'); setCanvasStep(0); }}
                  className="mt-8 w-full py-3 bg-purple-600 hover:bg-purple-500 text-white font-medium rounded-xl transition-colors flex justify-center items-center group"
                >
                  Launch Architectural Canvas <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Sandbox View (Ex 1) */}
        {activeTab === 'sandbox-ex1' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveTab('exercises')}
              className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Exercises
            </button>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col md:flex-row h-[700px]">
              
              {/* Left Column: Context & Payload */}
              <div className="w-full md:w-1/3 border-r border-slate-800 flex flex-col bg-slate-950/50">
                <div className="p-4 border-b border-slate-800 bg-slate-900">
                  <h3 className="font-bold text-white flex items-center"><ShieldAlert className="w-4 h-4 mr-2 text-blue-400" /> Scenario Context</h3>
                </div>
                <div className="p-6 flex-1 overflow-y-auto space-y-6">
                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Simulated Payload Request</h4>
                    <div className="bg-slate-900 border border-slate-800 rounded-lg p-3">
                      <pre className="text-[11px] text-blue-300 font-mono">
{`{
  "agent_id": "AP-Agent-02",
  "tool_call": "execute_sweep",
  "arguments": {
    "source_account": "1001-A",
    "target_account": "1001-B",
    "amount_usd": 30000,
    "rationale": "Cover anticipated deficit"
  }
}`}
                      </pre>
                    </div>
                  </div>

                  <div>
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">Instructions</h4>
                    <p className="text-sm text-slate-400 leading-relaxed mb-4">
                      The agent is attempting to sweep <strong className="text-red-400">$30,000</strong>. Your Guardrail Node policy dictates a strict <strong className="text-emerald-400">$25,000</strong> limit.
                    </p>
                    <p className="text-sm text-slate-400 leading-relaxed">
                      Review the JSON policy configuration in the editor. Once confirmed, execute the simulation to observe how the Evaluator Node systematically intercepts and rejects the out-of-bounds tool execution.
                    </p>
                  </div>
                </div>
                <div className="p-4 border-t border-slate-800 bg-slate-900">
                  <button 
                    onClick={runSandboxSimulation}
                    disabled={isSimulating}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-900 disabled:text-emerald-500 text-white font-bold py-3 px-4 rounded-xl flex items-center justify-center transition-colors"
                  >
                    {isSimulating ? (
                      <><Activity className="w-5 h-5 mr-2 animate-spin" /> Evaluating Policy...</>
                    ) : (
                      <><Play className="w-5 h-5 mr-2" /> Run Policy Engine</>
                    )}
                  </button>
                </div>
              </div>

              {/* Right Column: IDE */}
              <div className="w-full md:w-2/3 flex flex-col bg-[#0d1117]">
                
                {/* AI Prompt Bar */}
                <div className="p-3 border-b border-slate-800 bg-[#161b22] flex items-center space-x-2">
                  <Sparkles className="w-4 h-4 text-purple-400 flex-shrink-0" />
                  <input 
                    type="text" 
                    value={policyPrompt}
                    onChange={(e) => setPolicyPrompt(e.target.value)}
                    placeholder="Describe rule (e.g., 'Limit sweeps to 10k EUR and require same entity')" 
                    className="flex-1 bg-[#010409] border border-slate-700 rounded-md px-3 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-purple-500 transition-colors placeholder:text-slate-600"
                    onKeyDown={(e) => e.key === 'Enter' && handleGeneratePolicy()}
                  />
                  <button 
                    onClick={handleGeneratePolicy}
                    disabled={isGeneratingPolicy || !policyPrompt.trim()}
                    className="bg-purple-600/20 hover:bg-purple-600/40 text-purple-400 border border-purple-500/30 px-3 py-1.5 rounded-md text-xs font-bold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center min-w-[120px] justify-center"
                  >
                    {isGeneratingPolicy ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating...</> : "✨ Auto-Generate"}
                  </button>
                </div>

                {/* Editor Tabs */}
                <div className="flex border-b border-slate-800 bg-[#010409]">
                  <div className="px-4 py-2 border-r border-slate-800 bg-[#0d1117] flex items-center">
                    <Code className="w-4 h-4 mr-2 text-blue-400" />
                    <span className="text-xs text-slate-300 font-mono">guardrail_policy.json</span>
                  </div>
                </div>

                {/* Code Editor */}
                <div className="flex-1 p-4 overflow-y-auto">
                  <textarea 
                    value={policyCode}
                    onChange={(e) => setPolicyCode(e.target.value)}
                    className="w-full h-full bg-transparent text-slate-300 font-mono text-sm resize-none focus:outline-none focus:ring-0 leading-relaxed"
                    spellCheck="false"
                  />
                </div>

                {/* Terminal / Output */}
                <div className="h-64 border-t border-slate-800 bg-[#010409] flex flex-col">
                  <div className="px-4 py-2 border-b border-slate-800 flex items-center bg-slate-900/50">
                    <Terminal className="w-4 h-4 mr-2 text-slate-400" />
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Evaluation Output</span>
                  </div>
                  <div className="p-4 flex-1 overflow-y-auto font-mono text-xs">
                    {!sandboxOutput && !isSimulating && (
                      <span className="text-slate-600">Waiting for execution...</span>
                    )}
                    {isSimulating && (
                      <div className="text-yellow-500/80 space-y-1">
                        <p>&gt; Checking tool registry for 'execute_sweep'... OK.</p>
                        <p className="animate-pulse">&gt; Loading deterministic policy 'auto_sweep_limits'...</p>
                      </div>
                    )}
                    {sandboxOutput && (
                      <div className="text-red-400 animate-in fade-in slide-in-from-top-2 duration-300">
                        <p className="mb-2 text-red-500 font-bold">&gt; FATAL: Policy Breach Detected.</p>
                        <pre className="text-red-300 bg-red-950/30 p-4 rounded-lg border border-red-900/50 mb-3 overflow-x-auto">
                          {sandboxOutput}
                        </pre>
                        
                        {!explanation ? (
                          <div className="flex items-center justify-between mt-2">
                            <p className="text-orange-400 flex items-center">
                              <Lock className="w-3 h-3 mr-1" /> State memory serialized. Awaiting HITL interrupt resolution.
                            </p>
                            <button 
                              onClick={handleExplainBreach}
                              disabled={isExplaining}
                              className="bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-400 px-3 py-1.5 rounded text-xs font-bold transition-colors disabled:opacity-50 flex items-center"
                            >
                              {isExplaining ? <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Translating Log...</> : "✨ Explain to Stakeholder"}
                            </button>
                          </div>
                        ) : (
                          <div className="mt-4 p-4 bg-blue-950/30 border border-blue-900/50 rounded-lg animate-in fade-in duration-300">
                            <div className="flex items-center text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">
                              <Sparkles className="w-3 h-3 mr-1" /> Executive Summary
                            </div>
                            <p className="text-slate-300 leading-relaxed text-sm">
                              {explanation}
                            </p>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Canvas View (Ex 2) */}
        {activeTab === 'canvas-ex2' && (
          <div className="animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setActiveTab('exercises')}
              className="flex items-center text-slate-400 hover:text-white mb-6 transition-colors text-sm"
            >
              <ChevronLeft className="w-4 h-4 mr-1" /> Back to Exercises
            </button>
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl flex flex-col h-[750px]">
              {/* Header */}
              <div className="p-6 border-b border-slate-800 bg-slate-950 flex justify-between items-center">
                <div>
                  <h3 className="font-bold text-2xl text-white flex items-center">
                    <Workflow className="w-6 h-6 mr-3 text-purple-500" />
                    NemoClaw Network Trace
                  </h3>
                  <p className="text-sm text-slate-400 mt-1">Simulating an unauthorized outbound API hallucination.</p>
                </div>
                
                {/* Stepper Controls */}
                <div className="flex space-x-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
                  <button onClick={() => setCanvasStep(Math.max(0, canvasStep - 1))} disabled={canvasStep === 0} className="px-4 py-2 text-xs font-bold text-slate-400 hover:text-white disabled:opacity-50 disabled:hover:text-slate-400 bg-slate-800 rounded hover:bg-slate-700 transition-colors">Prev</button>
                  <button onClick={() => setCanvasStep(Math.min(4, canvasStep + 1))} disabled={canvasStep === 4} className="px-4 py-2 text-xs font-bold text-white bg-purple-600 hover:bg-purple-500 disabled:opacity-50 rounded transition-colors flex items-center">
                    {canvasStep === 4 ? 'Trace Complete' : 'Next Step'} <Play className="w-3 h-3 ml-1" />
                  </button>
                </div>
              </div>

              {/* Interactive Flow Area */}
              <div className="flex-1 relative bg-slate-950 p-8 overflow-hidden">
                {/* Background Grid */}
                <div className="absolute inset-0 bg-slate-900/50 bg-[radial-gradient(#334155_1px,transparent_1px)] [background-size:24px_24px] opacity-30"></div>

                {/* Network Diagram Nodes */}
                <div className="relative z-10 h-full flex flex-col justify-center">
                  <div className="flex items-center justify-between w-full max-w-5xl mx-auto px-4 md:px-12">
                    
                    {/* Node 1: AI Agent */}
                    <div className={`flex flex-col items-center transition-all duration-500 ${canvasStep >= 0 ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                      <div className={`w-24 h-24 rounded-2xl flex items-center justify-center border-2 shadow-2xl relative ${canvasStep === 0 || canvasStep === 1 ? 'bg-blue-900/40 border-blue-500 shadow-blue-500/20' : 'bg-slate-800 border-slate-700'}`}>
                        {(canvasStep === 0 || canvasStep === 1) && <span className="absolute -top-1 -right-1 flex h-4 w-4"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span><span className="relative inline-flex rounded-full h-4 w-4 bg-blue-500"></span></span>}
                        <BotIcon className={`w-12 h-12 ${(canvasStep === 0 || canvasStep === 1) ? 'text-blue-400' : 'text-slate-400'}`} />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-bold text-white whitespace-nowrap">Month-End Agent</p>
                        <div className={`absolute w-36 -ml-6 mt-2 p-2 rounded border text-[10px] font-mono transition-opacity duration-300 ${canvasStep === 0 ? 'bg-blue-950/50 border-blue-800 text-blue-300 opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          "I need the hotel rate.<br/>Let me call a public API."
                        </div>
                      </div>
                    </div>

                    {/* Arrow 1 */}
                    <div className="flex-1 px-2 md:px-4 relative flex items-center justify-center">
                      <div className={`h-1.5 w-full rounded-full transition-all duration-500 relative overflow-hidden ${canvasStep >= 1 ? 'bg-slate-800' : 'bg-transparent'}`}>
                        <div className={`absolute top-0 bottom-0 left-0 bg-purple-500 transition-all duration-700 ease-in-out ${canvasStep >= 1 ? 'w-full opacity-100' : 'w-0 opacity-0'}`}></div>
                      </div>
                      <div className={`absolute -top-8 transition-opacity duration-300 ${canvasStep >= 1 && canvasStep < 3 ? 'opacity-100' : 'opacity-0'}`}>
                        <div className="text-[10px] text-slate-400 font-mono bg-slate-900 px-2 py-1 border border-slate-800 rounded whitespace-nowrap shadow-lg">
                          requests.get('public-api.com')
                        </div>
                      </div>
                    </div>

                    {/* Node 2: OpenShell Sandbox / Registry */}
                    <div className={`flex flex-col items-center transition-all duration-500 ${canvasStep >= 1 ? 'opacity-100 scale-100' : 'opacity-30 scale-95'}`}>
                      <div className={`w-24 h-24 rounded-full flex items-center justify-center border-4 shadow-2xl relative z-20 bg-slate-900 transition-colors duration-500
                        ${canvasStep === 2 ? 'border-purple-500 shadow-purple-500/20' : canvasStep >= 3 ? 'border-red-500 shadow-red-500/30' : 'border-slate-700'}`}>
                        {canvasStep >= 3 ? <ShieldAlert className="w-10 h-10 text-red-500 animate-in zoom-in duration-300" /> : <Layers className={`w-10 h-10 ${canvasStep === 2 ? 'text-purple-400 animate-pulse' : 'text-slate-500'}`} />}
                      </div>
                      <div className="mt-4 text-center relative z-20">
                        <p className="font-bold text-white flex items-center justify-center whitespace-nowrap"><Lock className="w-3 h-3 mr-1" /> OpenShell Registry</p>
                        <div className={`absolute w-40 -ml-8 mt-2 p-2 rounded border text-[10px] font-mono transition-all duration-500
                          ${canvasStep === 2 ? 'bg-purple-950/50 border-purple-800 text-purple-300 opacity-100' : canvasStep >= 3 ? 'bg-red-950/50 border-red-800 text-red-400 font-bold opacity-100' : 'opacity-0 pointer-events-none'}`}>
                          {canvasStep === 2 ? 'Checking Authorized Tools...' : 'TOOL_NOT_REGISTERED\nOutbound Blocked'}
                        </div>
                      </div>
                      {/* Visual Sandbox Boundary */}
                      <div className={`absolute border border-dashed transition-all duration-700 -z-10 rounded-3xl ${canvasStep >= 2 ? 'border-slate-600 w-[300px] h-[300px] bg-slate-800/10' : 'border-transparent w-24 h-24'}`}></div>
                    </div>

                    {/* Arrow 2 (Blocked) */}
                    <div className="flex-1 px-2 md:px-4 relative flex items-center justify-center">
                      <div className={`h-1.5 w-full rounded-full transition-all duration-500 ${canvasStep >= 1 ? 'bg-slate-800' : 'bg-transparent'}`}></div>
                      {canvasStep >= 3 && (
                        <div className="absolute top-1/2 -translate-y-1/2 left-1/2 -translate-x-1/2 text-red-500 bg-slate-950 p-1.5 rounded-full z-10 shadow-lg shadow-red-900/20 animate-in zoom-in duration-300 border border-red-900/50">
                          <XCircle className="w-6 h-6 md:w-8 md:h-8" />
                        </div>
                      )}
                    </div>

                    {/* Node 3: External Internet */}
                    <div className={`flex flex-col items-center opacity-30 grayscale transition-all duration-500`}>
                      <div className="w-24 h-24 rounded-2xl bg-slate-900 border-2 border-slate-700 flex items-center justify-center">
                        <Cloud className="w-12 h-12 text-slate-500" />
                      </div>
                      <div className="mt-4 text-center">
                        <p className="font-bold text-slate-400 whitespace-nowrap">Public Web</p>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Audit Trail Log (Bottom) */}
                <div className={`absolute bottom-8 left-1/2 -translate-x-1/2 w-[90%] md:w-[600px] transition-all duration-500 transform ${canvasStep >= 4 ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0 pointer-events-none'}`}>
                  <div className="bg-slate-900 border border-orange-500/50 rounded-xl overflow-hidden shadow-2xl shadow-orange-900/20">
                    <div className="bg-slate-950 px-4 py-3 border-b border-orange-900/50 flex items-center justify-between">
                      <div className="flex items-center text-orange-400 text-xs font-bold uppercase tracking-wider">
                        <Database className="w-4 h-4 mr-2" /> State Memory Checkpoint
                      </div>
                      <span className="text-[10px] text-slate-500 font-mono">ID: SEC-LOG-9941</span>
                    </div>
                    <div className="p-5 font-mono text-xs md:text-sm text-slate-300 leading-relaxed">
                      <div className="text-slate-500 mb-2">// Event logged to tamper-proof storage</div>
                      <span className="text-red-400 font-bold">ERROR_CODE:</span> UNAUTHORIZED_NETWORK_CALL<br/>
                      <span className="text-blue-400 font-bold">AGENT_ID:</span> month_end_ap_01<br/>
                      <span className="text-purple-400 font-bold">ATTEMPTED_URI:</span> https://public-hotel-api.com/v1/rates<br/>
                      <span className="text-orange-400 font-bold">ACTION_TAKEN:</span> Network egress blocked by OpenShell Firewall. Execution suspended.
                    </div>
                  </div>
                </div>

              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}

// Helper icon since standard Lucide bot isn't always available in all versions
function BotIcon(props) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <path d="M12 8V4H8"/>
      <rect width="16" height="12" x="4" y="8" rx="2"/>
      <path d="M2 14h2"/>
      <path d="M20 14h2"/>
      <path d="M15 13v2"/>
      <path d="M9 13v2"/>
    </svg>
  );
}