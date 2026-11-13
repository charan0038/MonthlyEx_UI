import React, { useState, useEffect, useCallback } from 'react';
import {
  X,
  Calculator as CalcIcon,
  Delete,
  Copy,
  Check,
  History,
  Trash2,
  ArrowRight,
  Plus,
} from 'lucide-react';

interface HistoryItem {
  id: string;
  expression: string;
  result: string;
  timestamp: string;
}

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApplyResult?: (result: number) => void;
  initialValue?: number;
}

export const CalculatorModal: React.FC<CalculatorModalProps> = ({
  isOpen,
  onClose,
  onApplyResult,
  initialValue,
}) => {
  const [display, setDisplay] = useState<string>('0');
  const [prevValue, setPrevValue] = useState<number | null>(null);
  const [operation, setOperation] = useState<string | null>(null);
  const [expression, setExpression] = useState<string>('');
  const [isNewInput, setIsNewInput] = useState<boolean>(true);
  const [history, setHistory] = useState<HistoryItem[]>([]);
  const [showHistory, setShowHistory] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Initialize or reset on open
  useEffect(() => {
    if (isOpen) {
      if (initialValue && initialValue > 0) {
        setDisplay(initialValue.toString());
        setExpression('');
      } else {
        setDisplay('0');
        setExpression('');
      }
      setPrevValue(null);
      setOperation(null);
      setIsNewInput(true);
      setShowHistory(false);
      setCopied(false);
    }
  }, [isOpen, initialValue]);

  // Clean arithmetic with precision safety
  const compute = (a: number, b: number, op: string): number => {
    let res = 0;
    switch (op) {
      case '+':
        res = a + b;
        break;
      case '−':
      case '-':
        res = a - b;
        break;
      case '×':
      case '*':
        res = a * b;
        break;
      case '÷':
      case '/':
        res = b !== 0 ? a / b : 0;
        break;
      default:
        res = b;
    }
    // Round to max 8 decimal places to eliminate floating point issues (e.g. 0.1+0.2)
    return Math.round(res * 100000000) / 100000000;
  };

  const handleDigit = useCallback(
    (digit: string) => {
      setDisplay((prev) => {
        if (digit === '.') {
          if (isNewInput) {
            setIsNewInput(false);
            return '0.';
          }
          if (prev.includes('.')) return prev;
          return prev + '.';
        }

        if (isNewInput || prev === '0') {
          setIsNewInput(false);
          return digit;
        }

        // Limit digits to 12 chars to avoid overflow
        if (prev.replace(/[^0-9]/g, '').length >= 12) return prev;
        return prev + digit;
      });
    },
    [isNewInput]
  );

  const handleOperator = useCallback(
    (nextOp: string) => {
      const current = parseFloat(display);

      if (prevValue === null) {
        setPrevValue(current);
        setOperation(nextOp);
        setExpression(`${current} ${nextOp}`);
        setIsNewInput(true);
      } else if (operation) {
        if (isNewInput) {
          // Just change operator if user pressed another operator without entering a number
          setOperation(nextOp);
          setExpression(`${prevValue} ${nextOp}`);
        } else {
          const result = compute(prevValue, current, operation);
          setPrevValue(result);
          setDisplay(result.toString());
          setOperation(nextOp);
          setExpression(`${result} ${nextOp}`);
          setIsNewInput(true);
        }
      }
    },
    [display, prevValue, operation, isNewInput]
  );

  const handleEquals = useCallback(() => {
    if (prevValue === null || operation === null) return;

    const current = parseFloat(display);
    const result = compute(prevValue, current, operation);
    const exprString = `${prevValue} ${operation} ${current} =`;

    setDisplay(result.toString());
    setExpression(exprString);
    setPrevValue(null);
    setOperation(null);
    setIsNewInput(true);

    // Add to history
    setHistory((prev) => [
      {
        id: Math.random().toString(36).substring(2, 9),
        expression: exprString,
        result: result.toString(),
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      },
      ...prev.slice(0, 19), // keep last 20
    ]);
  }, [display, prevValue, operation]);

  const handleClear = useCallback(() => {
    setDisplay('0');
    setPrevValue(null);
    setOperation(null);
    setExpression('');
    setIsNewInput(true);
  }, []);

  const handleBackspace = useCallback(() => {
    if (isNewInput) return;
    setDisplay((prev) => {
      if (prev.length <= 1 || (prev.length === 2 && prev.startsWith('-'))) {
        return '0';
      }
      return prev.slice(0, -1);
    });
  }, [isNewInput]);

  const handleToggleSign = useCallback(() => {
    setDisplay((prev) => {
      const num = parseFloat(prev);
      if (num === 0) return prev;
      return (num * -1).toString();
    });
  }, []);

  const handlePercent = useCallback(() => {
    setDisplay((prev) => {
      const num = parseFloat(prev);
      const res = num / 100;
      return (Math.round(res * 100000000) / 100000000).toString();
    });
    setIsNewInput(true);
  }, []);

  // Quick financial shortcuts
  const handleAddGst = (pct: number) => {
    const current = parseFloat(display);
    if (isNaN(current) || current <= 0) return;
    const tax = current * (pct / 100);
    const total = Math.round((current + tax) * 100) / 100;
    setExpression(`${current} + ${pct}% GST (${tax.toFixed(2)}) =`);
    setDisplay(total.toString());
    setIsNewInput(true);
  };

  const handleSplitBill = (people: number) => {
    const current = parseFloat(display);
    if (isNaN(current) || current <= 0) return;
    const perPerson = Math.round((current / people) * 100) / 100;
    setExpression(`${current} split by ${people} =`);
    setDisplay(perPerson.toString());
    setIsNewInput(true);
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(display);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleApply = () => {
    const val = parseFloat(display);
    if (!isNaN(val) && val > 0 && onApplyResult) {
      onApplyResult(val);
      onClose();
    }
  };

  // Keyboard navigation support
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't capture keyboard if user is typing in an input
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement ||
        e.target instanceof HTMLSelectElement
      ) {
        return;
      }

      if (e.key >= '0' && e.key <= '9') {
        e.preventDefault();
        handleDigit(e.key);
      } else if (e.key === '.') {
        e.preventDefault();
        handleDigit('.');
      } else if (e.key === '+') {
        e.preventDefault();
        handleOperator('+');
      } else if (e.key === '-') {
        e.preventDefault();
        handleOperator('−');
      } else if (e.key === '*') {
        e.preventDefault();
        handleOperator('×');
      } else if (e.key === '/') {
        e.preventDefault();
        handleOperator('÷');
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleEquals();
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleBackspace();
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      } else if (e.key.toLowerCase() === 'c') {
        e.preventDefault();
        handleClear();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    isOpen,
    handleDigit,
    handleOperator,
    handleEquals,
    handleBackspace,
    handleClear,
    onClose,
  ]);

  if (!isOpen) return null;

  const numericValue = parseFloat(display);
  const formattedDisplay = isNaN(numericValue)
    ? display
    : display.endsWith('.')
    ? numericValue.toLocaleString('en-IN') + '.'
    : display.includes('.')
    ? numericValue.toLocaleString('en-IN', {
        minimumFractionDigits: display.split('.')[1].length,
        maximumFractionDigits: 8,
      })
    : numericValue.toLocaleString('en-IN');

  return (
    <div
      className="modal-backdrop active calc-modal-backdrop"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal-card calc-modal-card">
        {/* Header */}
        <div className="calc-modal-header">
          <div className="calc-header-title-wrap">
            <div className="calc-header-icon-box">
              <CalcIcon size={19} />
            </div>
            <div>
              <h3 className="calc-title">Calculator</h3>
              <p className="calc-subtitle">Smart financial & bill split</p>
            </div>
          </div>

          <div className="calc-header-actions">
            <button
              type="button"
              className={`calc-tool-btn ${showHistory ? 'active' : ''}`}
              onClick={() => setShowHistory(!showHistory)}
              title={showHistory ? 'Hide history' : 'Show calculation history'}
              aria-label="History"
            >
              <History size={16} />
              {history.length > 0 && <span className="calc-history-badge">{history.length}</span>}
            </button>
            <button
              type="button"
              className="modal-close-btn"
              onClick={onClose}
              aria-label="Close Calculator"
            >
              <X size={17} />
            </button>
          </div>
        </div>

        {/* Display Screen */}
        <div className="calc-screen-container">
          <div className="calc-expression-row">
            <span>{expression || '\u00A0'}</span>
          </div>

          <div className="calc-main-row">
            <span className="calc-currency-symbol">₹</span>
            <span className="calc-result-text" title={display}>
              {formattedDisplay}
            </span>
          </div>

          <div className="calc-screen-actions">
            <button
              type="button"
              className="calc-screen-action-btn"
              onClick={handleCopy}
              title="Copy result to clipboard"
            >
              {copied ? (
                <>
                  <Check size={12} color="#10b981" />
                  <span style={{ color: '#10b981' }}>Copied</span>
                </>
              ) : (
                <>
                  <Copy size={12} />
                  <span>Copy</span>
                </>
              )}
            </button>

            <button
              type="button"
              className="calc-screen-action-btn"
              onClick={handleBackspace}
              title="Backspace"
            >
              <Delete size={14} />
            </button>
          </div>
        </div>

        {/* Financial Quick Helpers */}
        <div className="calc-shortcuts-bar">
          <button
            type="button"
            className="calc-chip-btn"
            onClick={() => handleAddGst(18)}
            title="Add 18% GST"
          >
            +18% GST
          </button>
          <button
            type="button"
            className="calc-chip-btn"
            onClick={() => handleAddGst(5)}
            title="Add 5% GST"
          >
            +5% GST
          </button>
          <button
            type="button"
            className="calc-chip-btn"
            onClick={() => handleSplitBill(2)}
            title="Split bill between 2 people"
          >
            ÷ 2 Split
          </button>
          <button
            type="button"
            className="calc-chip-btn"
            onClick={() => handleSplitBill(3)}
            title="Split bill between 3 people"
          >
            ÷ 3 Split
          </button>
        </div>

        {/* History Tape Drawer */}
        {showHistory && (
          <div className="calc-history-drawer">
            <div className="calc-history-header">
              <span className="calc-history-title">Recent Calculations</span>
              {history.length > 0 && (
                <button
                  type="button"
                  className="calc-history-clear-btn"
                  onClick={() => setHistory([])}
                  title="Clear history"
                >
                  <Trash2 size={12} /> Clear
                </button>
              )}
            </div>

            <div className="calc-history-list">
              {history.length > 0 ? (
                history.map((h) => (
                  <button
                    key={h.id}
                    type="button"
                    className="calc-history-item"
                    onClick={() => {
                      setDisplay(h.result);
                      setExpression(h.expression);
                      setIsNewInput(true);
                      setShowHistory(false);
                    }}
                    title="Tap to load this result"
                  >
                    <div className="calc-history-expr">{h.expression}</div>
                    <div className="calc-history-val">₹{Number(h.result).toLocaleString('en-IN')}</div>
                  </button>
                ))
              ) : (
                <div className="calc-history-empty">No calculations yet</div>
              )}
            </div>
          </div>
        )}

        {/* 4x5 Modern Tactical Keypad */}
        <div className="calc-keypad-grid">
          {/* Row 1 */}
          <button type="button" className="calc-key key-clear" onClick={handleClear}>
            {prevValue !== null || display !== '0' ? 'C' : 'AC'}
          </button>
          <button type="button" className="calc-key key-func" onClick={handleToggleSign}>
            ±
          </button>
          <button type="button" className="calc-key key-func" onClick={handlePercent}>
            %
          </button>
          <button
            type="button"
            className={`calc-key key-op ${operation === '÷' ? 'active-op' : ''}`}
            onClick={() => handleOperator('÷')}
          >
            ÷
          </button>

          {/* Row 2 */}
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('7')}>
            7
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('8')}>
            8
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('9')}>
            9
          </button>
          <button
            type="button"
            className={`calc-key key-op ${operation === '×' ? 'active-op' : ''}`}
            onClick={() => handleOperator('×')}
          >
            ×
          </button>

          {/* Row 3 */}
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('4')}>
            4
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('5')}>
            5
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('6')}>
            6
          </button>
          <button
            type="button"
            className={`calc-key key-op ${operation === '−' ? 'active-op' : ''}`}
            onClick={() => handleOperator('−')}
          >
            −
          </button>

          {/* Row 4 */}
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('1')}>
            1
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('2')}>
            2
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('3')}>
            3
          </button>
          <button
            type="button"
            className={`calc-key key-op ${operation === '+' ? 'active-op' : ''}`}
            onClick={() => handleOperator('+')}
          >
            +
          </button>

          {/* Row 5 */}
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('0')}>
            0
          </button>
          <button type="button" className="calc-key key-num" onClick={() => handleDigit('.')}>
            .
          </button>
          <button type="button" className="calc-key key-num" onClick={handleBackspace} title="Delete">
            ⌫
          </button>
          <button type="button" className="calc-key key-equals" onClick={handleEquals}>
            =
          </button>
        </div>

        {/* Quick Apply to Transaction Footer */}
        {onApplyResult && (
          <div className="calc-footer-apply">
            <button
              type="button"
              className="calc-apply-btn"
              onClick={handleApply}
              disabled={isNaN(numericValue) || numericValue <= 0}
            >
              <Plus size={16} />
              <span>Use ₹{numericValue > 0 ? formattedDisplay : '0'} as Transaction Amount</span>
              <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

