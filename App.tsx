import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  DollarSign, 
  Plus, 
  Minus, 
  Receipt,
  RefreshCcw,
  Check
} from './components/Icons';
import ReceiptScanner from './components/ReceiptScanner';
import ResultsChart from './components/ResultsChart';
import { BillState, TipType, ReceiptData } from './types';

const App: React.FC = () => {
  // -- State --
  const [state, setState] = useState<BillState>({
    billAmount: 0,
    tipType: TipType.PERCENTAGE,
    tipValue: 18, // default 18%
    splitCount: 2,
    taxAmount: 0,
    includeTaxInTip: false,
  });

  const [receiptItems, setReceiptItems] = useState<Array<{name: string, price: number}>>([]);
  const [showScanner, setShowScanner] = useState(true);

  // -- Derived Values --
  const { totalTip, totalBill, perPerson } = useMemo(() => {
    // Tip calculation base:
    // If includeTaxInTip is true, we tip on (Bill). Note: Bill usually includes tax in user input if manually entered?
    // Let's assume 'billAmount' is the GRAND total from user input unless we split it out.
    // However, technically tip should be on Subtotal (Bill - Tax).
    // Let's clarify the logic:
    // User enters "Bill Amount". We assume this is the final number on the check bottom.
    // If User enters "Tax Amount", we can derive Subtotal = Bill - Tax.
    // Tip is usually calculated on Subtotal.
    
    let tipBase = state.billAmount;
    
    if (!state.includeTaxInTip && state.taxAmount > 0) {
      tipBase = Math.max(0, state.billAmount - state.taxAmount);
    }

    let calculatedTip = 0;
    if (state.tipType === TipType.PERCENTAGE) {
      calculatedTip = tipBase * (state.tipValue / 100);
    } else {
      calculatedTip = state.tipValue;
    }

    const finalBill = state.billAmount + calculatedTip;
    // Note: state.billAmount already includes tax if the user entered the total receipt value.
    // If the user entered Subtotal in Bill Amount, then we need to add Tax.
    // UX Decision: "Bill Amount" usually means "Total to Pay before Tip".
    
    const perPersonVal = state.splitCount > 0 ? finalBill / state.splitCount : 0;

    return {
      totalTip: calculatedTip,
      totalBill: finalBill,
      perPerson: perPersonVal
    };
  }, [state]);

  // -- Handlers --
  const handleScanComplete = (data: ReceiptData) => {
    setState(prev => ({
      ...prev,
      billAmount: data.total,
      taxAmount: data.tax || 0,
    }));
    if (data.items) {
      setReceiptItems(data.items);
    }
    // Auto-hide scanner to show results, but keep a toggle
    setShowScanner(false);
  };

  const updateState = (key: keyof BillState, value: any) => {
    setState(prev => ({ ...prev, [key]: value }));
  };

  // Preset tip percentages
  const tipPresets = [10, 15, 18, 20, 25];

  return (
    <div className="min-h-screen bg-slate-50 p-4 pb-32 md:p-8">
      <div className="mx-auto max-w-4xl">
        
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-slate-900">
              Bill Splitter <span className="text-indigo-600">AI</span>
            </h1>
            <p className="mt-1 text-slate-500">Scan receipts, calculate tips, and split efficiently.</p>
          </div>
          
          <button 
            onClick={() => {
              setState({
                billAmount: 0,
                tipType: TipType.PERCENTAGE,
                tipValue: 18,
                splitCount: 2,
                taxAmount: 0,
                includeTaxInTip: false,
              });
              setReceiptItems([]);
              setShowScanner(true);
            }}
            className="self-start rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm ring-1 ring-slate-200 hover:bg-slate-50 flex items-center gap-2"
          >
            <RefreshCcw className="h-4 w-4" /> Reset
          </button>
        </header>

        <div className="grid gap-6 lg:grid-cols-12">
          
          {/* LEFT COLUMN: Inputs */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* AI Scanner Section */}
            {showScanner ? (
              <ReceiptScanner onScanComplete={handleScanComplete} />
            ) : (
               <button 
                onClick={() => setShowScanner(true)}
                className="w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-indigo-200 text-indigo-600 hover:bg-indigo-50 text-sm font-medium transition-colors"
              >
                <Receipt className="h-4 w-4" /> Scan Receipt
              </button>
            )}

            <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
              
              {/* Bill Amount */}
              <div className="mb-6">
                <label className="block text-sm font-semibold text-slate-700 mb-2">
                  Bill Total
                </label>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                    <span className="text-slate-400 text-xl">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="block w-full rounded-xl border-0 bg-slate-50 py-4 pl-10 pr-4 text-2xl font-bold text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                    placeholder="0.00"
                    value={state.billAmount || ''}
                    onChange={(e) => updateState('billAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Tax (Optional, for precise tipping) */}
               <div className="mb-8">
                <div className="flex items-center justify-between mb-2">
                   <label className="block text-xs font-medium uppercase tracking-wider text-slate-500">
                    Tax Amount (included in total)
                  </label>
                  <button 
                    onClick={() => updateState('includeTaxInTip', !state.includeTaxInTip)}
                    className="text-xs text-indigo-600 hover:text-indigo-800 underline decoration-dotted underline-offset-2"
                  >
                    {state.includeTaxInTip ? 'Tipping on Tax' : 'Tip on Subtotal'}
                  </button>
                </div>
                <div className="relative">
                  <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                    <span className="text-slate-400 text-sm">$</span>
                  </div>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    className="block w-full rounded-lg border-0 bg-slate-50 py-2 pl-7 pr-4 text-slate-900 ring-1 ring-inset ring-slate-200 placeholder:text-slate-300 focus:ring-2 focus:ring-inset focus:ring-indigo-600 sm:text-sm sm:leading-6"
                    placeholder="0.00"
                    value={state.taxAmount || ''}
                    onChange={(e) => updateState('taxAmount', parseFloat(e.target.value) || 0)}
                  />
                </div>
              </div>

              {/* Tip Selection */}
              <div className="mb-8">
                <div className="flex items-center justify-between mb-3">
                  <label className="block text-sm font-semibold text-slate-700">Tip</label>
                  <div className="flex rounded-lg bg-slate-100 p-1">
                    <button
                      onClick={() => updateState('tipType', TipType.PERCENTAGE)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${state.tipType === TipType.PERCENTAGE ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      %
                    </button>
                    <button
                      onClick={() => updateState('tipType', TipType.FIXED)}
                      className={`rounded-md px-3 py-1 text-xs font-medium transition-all ${state.tipType === TipType.FIXED ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}
                    >
                      $
                    </button>
                  </div>
                </div>

                {state.tipType === TipType.PERCENTAGE ? (
                  <div className="space-y-3">
                    <div className="grid grid-cols-5 gap-2">
                      {tipPresets.map((pct) => (
                        <button
                          key={pct}
                          onClick={() => updateState('tipValue', pct)}
                          className={`
                            flex items-center justify-center rounded-xl py-3 text-sm font-bold transition-all
                            ${state.tipValue === pct 
                              ? 'bg-indigo-600 text-white shadow-md shadow-indigo-200 scale-105' 
                              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                            }
                          `}
                        >
                          {pct}%
                        </button>
                      ))}
                    </div>
                    {/* Custom slider for percentage */}
                    <div className="pt-2">
                       <input 
                        type="range" 
                        min="0" 
                        max="50" 
                        value={state.tipValue} 
                        onChange={(e) => updateState('tipValue', parseInt(e.target.value))}
                        className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                      />
                       <div className="flex justify-between text-xs text-slate-400 mt-1">
                        <span>0%</span>
                        <span className="text-indigo-600 font-semibold">{state.tipValue}%</span>
                        <span>50%</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="relative">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-slate-400">$</span>
                    </div>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      className="block w-full rounded-xl border-0 bg-slate-50 py-3 pl-8 pr-4 text-lg font-semibold text-slate-900 ring-1 ring-inset ring-slate-200 focus:ring-2 focus:ring-inset focus:ring-indigo-600"
                      value={state.tipValue || ''}
                      onChange={(e) => updateState('tipValue', parseFloat(e.target.value) || 0)}
                    />
                  </div>
                )}
              </div>

              {/* Split Count */}
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-3">
                  Split Between
                </label>
                <div className="flex items-center justify-between rounded-xl bg-slate-50 p-2 ring-1 ring-inset ring-slate-200">
                   <button 
                    onClick={() => updateState('splitCount', Math.max(1, state.splitCount - 1))}
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-white text-slate-600 shadow-sm hover:bg-slate-100 active:scale-95 transition-all"
                  >
                    <Minus className="h-5 w-5" />
                  </button>
                  
                  <div className="flex flex-col items-center">
                    <span className="text-2xl font-bold text-slate-900">{state.splitCount}</span>
                    <span className="text-xs font-medium text-slate-400">people</span>
                  </div>

                  <button 
                    onClick={() => updateState('splitCount', state.splitCount + 1)}
                    className="flex h-12 w-12 items-center justify-center rounded-lg bg-indigo-600 text-white shadow-md shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all"
                  >
                    <Plus className="h-5 w-5" />
                  </button>
                </div>
              </div>

            </div>

             {/* Items Preview (if any) */}
             {receiptItems.length > 0 && (
              <div className="rounded-2xl bg-white p-6 shadow-sm ring-1 ring-slate-900/5">
                <h3 className="font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Receipt className="h-4 w-4 text-slate-400" />
                  Detected Items
                </h3>
                <div className="space-y-2 max-h-60 overflow-y-auto pr-2 custom-scrollbar">
                  {receiptItems.map((item, idx) => (
                    <div key={idx} className="flex justify-between text-sm py-2 border-b border-slate-50 last:border-0">
                      <span className="text-slate-600">{item.name}</span>
                      <span className="font-medium text-slate-900">${item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: Results */}
          <div className="lg:col-span-5 space-y-6">
            <div className="sticky top-6 rounded-3xl bg-slate-900 p-6 text-white shadow-xl shadow-slate-900/20 md:p-8">
              <h2 className="mb-6 text-lg font-medium text-slate-300 flex items-center gap-2">
                <DollarSign className="h-5 w-5 text-indigo-400" />
                Total per person
              </h2>
              
              <div className="mb-8 text-center">
                <div className="text-6xl font-bold tracking-tighter text-white md:text-7xl">
                  ${perPerson.toFixed(2)}
                </div>
                <p className="mt-2 text-sm text-slate-400">
                  Total Bill: <span className="text-white font-medium">${totalBill.toFixed(2)}</span>
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4 border-t border-slate-800 pt-8">
                <div className="rounded-2xl bg-slate-800/50 p-4">
                  <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Total Tip</p>
                  <p className="text-2xl font-bold text-emerald-400">${totalTip.toFixed(2)}</p>
                   <p className="text-xs text-slate-500 mt-1">
                    ${(totalTip / state.splitCount).toFixed(2)} / person
                  </p>
                </div>
                <div className="rounded-2xl bg-slate-800/50 p-4">
                   <p className="text-xs font-medium uppercase tracking-wider text-slate-400 mb-1">Bill (No Tip)</p>
                   <p className="text-2xl font-bold text-blue-400">${state.billAmount.toFixed(2)}</p>
                   <p className="text-xs text-slate-500 mt-1">
                    ${(state.billAmount / state.splitCount).toFixed(2)} / person
                  </p>
                </div>
              </div>

              {/* Chart Visual */}
              <div className="mt-8 pt-6 border-t border-slate-800">
                 <p className="text-xs font-medium uppercase tracking-wider text-slate-500 mb-4 text-center">Breakdown</p>
                <div className="bg-slate-800/30 rounded-2xl p-4">
                   <ResultsChart 
                    billAmount={state.billAmount} 
                    tipAmount={totalTip} 
                    taxAmount={state.taxAmount} 
                  />
                </div>
              </div>

            </div>

            {/* Quick Helper */}
            <div className="rounded-2xl bg-indigo-50 p-6 text-indigo-900">
               <h3 className="font-semibold mb-2 flex items-center gap-2">
                 <Users className="h-4 w-4" />
                 Split Logic
               </h3>
               <p className="text-sm opacity-80 leading-relaxed">
                 Dividing by {state.splitCount} people. 
                 {state.taxAmount > 0 && !state.includeTaxInTip && 
                  " Tip is calculated on the subtotal (excluding tax)."}
                 {state.taxAmount > 0 && state.includeTaxInTip && 
                  " Tip is calculated on the total (including tax)."}
               </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default App;