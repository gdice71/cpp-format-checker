'use client'

import { useState, useRef, useEffect } from 'react'

interface FormatError {
  line: number
  rule: string
  message: string
  severity: 'warning' | 'info'
}

export default function Home() {
  const [code, setCode] = useState('')
  const [errors, setErrors] = useState<FormatError[]>([])
  const [hasChecked, setHasChecked] = useState(false)
  const [lineNumbers, setLineNumbers] = useState<string[]>(['1'])
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const lineNumbersRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const lines = code.split('\n')
    const newLineNumbers = Array.from({ length: Math.max(lines.length, 1) }, (_, i) => String(i + 1))
    setLineNumbers(newLineNumbers)
  }, [code])

  const handleScroll = (e: React.UIEvent<HTMLTextAreaElement>) => {
    if (lineNumbersRef.current && textareaRef.current) {
      lineNumbersRef.current.scrollTop = textareaRef.current.scrollTop
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Tab') {
      e.preventDefault()
      const start = e.currentTarget.selectionStart
      const end = e.currentTarget.selectionEnd
      const newCode = code.substring(0, start) + '  ' + code.substring(end)
      setCode(newCode)
      
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2
        }
      }, 0)
    }
  }

  const analyzeCode = (inputCode: string): FormatError[] => {
    const lines = inputCode.split('\n')
    const foundErrors: FormatError[] = []

    lines.forEach((line, index) => {
      const lineNum = index + 1

      // Rule 2: Single letter variables
      if (!line.trim().startsWith('//')) {
        const singleLetterVars = line.match(/\b(int|double|float|char|long|short|bool)\s+([a-z])\s*=/gi)
        if (singleLetterVars) {
          foundErrors.push({
            line: lineNum,
            rule: 'Variable Naming',
            message: 'Avoid single-letter variable names. Use descriptive names like "target_x" or "milesPerHour".',
            severity: 'info'
          })
        }
      }

      // Rule 3: Magic numbers
      if (!line.trim().startsWith('//') && !line.includes('const')) {
        const magicNumbers = line.match(/[=+\-*\/]\s*\d+\.\d+/g)
        if (magicNumbers) {
          foundErrors.push({
            line: lineNum,
            rule: 'Magic Numbers',
            message: 'Use named constants instead of magic numbers (e.g., const double US_TO_CDN = 1.252).',
            severity: 'info'
          })
        }
      }

      // Rule 4: Constants naming - must be ALL_CAPS
      const constMatch = line.match(/const\s+\w+\s+([a-zA-Z_][a-zA-Z0-9_]*)\s*=/)
      if (constMatch) {
        const constName = constMatch[1]
        // Constant must be all uppercase with optional underscores
        if (constName !== constName.toUpperCase()) {
          foundErrors.push({
            line: lineNum,
            rule: 'Constant Naming',
            message: `Constant '${constName}' should be in ALL_CAPS (e.g., MAX_SIZE, not ${constName}).`,
            severity: 'warning'
          })
        }
      }

      // Rule 6: Uninitialized variables
      const uninitVar = line.match(/\b(int|double|float|char|long|short|bool)\s+[a-zA-Z_][a-zA-Z0-9_]*\s*;/)
      if (uninitVar && !line.includes('//')) {
        foundErrors.push({
          line: lineNum,
          rule: 'Variable Initialization',
          message: 'Variables should be initialized when declared (e.g., int x = 0;).',
          severity: 'warning'
        })
      }

      // Rule 7: IMPROVED spacing detection
      if (!line.trim().startsWith('//')) {
        // Check for if/while/for conditions with poor spacing
        const conditionMatch = line.match(/(if|while|for)\s*\([^)]+\)/)
        if (conditionMatch) {
          const condition = conditionMatch[0]
          
          // Check for operators without spaces
          const noSpacePatterns = [
            /\w+[<>=!]{1,2}\w+/,  // x<=5
            /\w+&&\w+/,            // x&&y
            /\w+\|\|\w+/,          // x||y
            /\w+[+\-*\/]\w+/,      // x+y (but not in strings)
          ]
          
          let hasSpacingIssue = false
          for (const pattern of noSpacePatterns) {
            if (pattern.test(condition)) {
              hasSpacingIssue = true
              break
            }
          }
          
          if (hasSpacingIssue) {
            foundErrors.push({
              line: lineNum,
              rule: 'Expression Spacing',
              message: 'Use spaces around operators. Example: if ( x <= 5 && y >= 0 || z == 8 )',
              severity: 'warning'
            })
          }
        }
        
        // Also check for operators outside conditions
        if (!line.includes('if') && !line.includes('while') && !line.includes('for')) {
          if (line.match(/\w+[<>=!]{2}\w+/) || line.match(/\w+&&\w+/) || line.match(/\w+\|\|\w+/)) {
            foundErrors.push({
              line: lineNum,
              rule: 'Expression Spacing',
              message: 'Use spaces around operators for better readability.',
              severity: 'info'
            })
          }
        }
      }

      // Rule 8: Statement on same line
      if (line.match(/if\s*\([^)]+\)\s*[a-zA-Z]/) && !line.includes('//')) {
        foundErrors.push({
          line: lineNum,
          rule: 'Code Structure',
          message: 'Statement should be on a separate line from the condition.',
          severity: 'warning'
        })
      }

      // Rule 9: Brace placement and indentation
      if (line.match(/\)\s*{/) && !line.trim().startsWith('//')) {
        foundErrors.push({
          line: lineNum,
          rule: 'Brace Placement',
          message: 'Opening brace should be on its own line.',
          severity: 'info'
        })
      }
      
      // Check if this line is just a curly brace
      const trimmedLine = line.trim()
      if ((trimmedLine === '{' || trimmedLine === '}') && !line.includes('//')) {
        const braceIndent = line.match(/^( *)/)?.[1].length || 0
        
        // Look at the previous non-empty line to check alignment
        if (trimmedLine === '{') {
          // Opening brace - check previous line
          for (let i = index - 1; i >= 0; i--) {
            const prevLine = lines[i].trim()
            if (prevLine.length > 0 && !prevLine.startsWith('//')) {
              const prevIndent = lines[i].match(/^( *)/)?.[1].length || 0
              
              // Brace should have same indentation as its control structure
              if (braceIndent !== prevIndent) {
                foundErrors.push({
                  line: lineNum,
                  rule: 'Brace Indentation',
                  message: `Opening brace should align with its control structure (expected ${prevIndent} spaces, found ${braceIndent} spaces).`,
                  severity: 'warning'
                })
              }
              break
            }
          }
        } else if (trimmedLine === '}') {
          // Closing brace - find matching opening brace
          let openBraceIndent = -1
          let braceCount = 1
          
          for (let i = index - 1; i >= 0 && braceCount > 0; i--) {
            const checkLine = lines[i].trim()
            if (checkLine === '}') braceCount++
            if (checkLine === '{') {
              braceCount--
              if (braceCount === 0) {
                // Check if opening brace is on same line as declaration (e.g., "int main() {")
                const openBraceLine = lines[i]
                if (openBraceLine.trim() === '{') {
                  // It's on its own line
                  openBraceIndent = openBraceLine.match(/^( *)/)?.[1].length || 0
                } else {
                  // Brace is on same line as declaration - find the declaration's indent
                  openBraceIndent = openBraceLine.match(/^( *)/)?.[1].length || 0
                }
                break
              }
            }
          }
          
          if (openBraceIndent !== -1 && braceIndent !== openBraceIndent) {
            foundErrors.push({
              line: lineNum,
              rule: 'Brace Indentation',
              message: `Closing brace should align with opening brace (expected ${openBraceIndent} spaces, found ${braceIndent} spaces).`,
              severity: 'warning'
            })
          }
        }
      }

      // Rule 13: File handling
      if (line.includes('ifstream') || line.includes('ofstream')) {
        const nextLines = lines.slice(index + 1, index + 5).join('\n')
        if (!nextLines.includes('if') || !nextLines.includes('!')) {
          foundErrors.push({
            line: lineNum,
            rule: 'File Handling',
            message: 'File streams should be checked for successful opening with if(!fin).',
            severity: 'warning'
          })
        }
      }

      // Indentation check - just ensure consistency (tabs OR spaces, not mixed)
      if (line.trim().length > 0 && !line.trim().startsWith('//')) {
        const hasTab = line.match(/^\t+/)
        const hasSpaces = line.match(/^ +/)
        
        // Check if line is indented with spaces
        if (hasSpaces && !hasTab) {
          const leadingSpaces = hasSpaces[0].length
          // Warn if not using 2-space indents
          if (leadingSpaces % 2 !== 0) {
            foundErrors.push({
              line: lineNum,
              rule: 'Indentation',
              message: `Indentation should be multiples of 2 spaces. This line has ${leadingSpaces} spaces.`,
              severity: 'info'
            })
          }
        }
        
        // Check if statement is inside a block but not indented
        const trimmed = line.trim()
        const currentIndent = line.match(/^( *)/)?.[1].length || 0
        
        // Skip braces and control structures themselves
        if (trimmed !== '{' && trimmed !== '}' && 
            !trimmed.startsWith('if') && !trimmed.startsWith('for') && 
            !trimmed.startsWith('while') && !trimmed.startsWith('else')) {
          
          // Look backwards to find if we're inside a block
          let blockDepth = 0
          let expectedIndent = -1
          
          for (let i = index - 1; i >= 0; i--) {
            const prevLine = lines[i]
            const prevTrimmed = prevLine.trim()
            
            // Count braces
            if (prevTrimmed === '}') blockDepth++
            if (prevTrimmed === '{') {
              blockDepth--
              if (blockDepth < 0) {
                // We found the opening brace of our current block
                const braceIndent = prevLine.match(/^( *)/)?.[1].length || 0
                expectedIndent = braceIndent + 2
                break
              }
            }
          }
          
          // If we found we're in a block and indentation is wrong
          if (expectedIndent !== -1 && currentIndent < expectedIndent) {
            foundErrors.push({
              line: lineNum,
              rule: 'Indentation',
              message: `Statement inside block should be indented ${expectedIndent} spaces (found ${currentIndent} spaces).`,
              severity: 'warning'
            })
          }
        }
      }
    })

    return foundErrors
  }

  const handleCheck = () => {
    if (!code.trim()) {
      return
    }
    const foundErrors = analyzeCode(code)
    setErrors(foundErrors)
    setHasChecked(true)
  }

  const handleClear = () => {
    setCode('')
    setErrors([])
    setHasChecked(false)
  }

  const warnings = errors.filter(e => e.severity === 'warning')
  const infos = errors.filter(e => e.severity === 'info')

  return (
    <main className="min-h-screen bg-bg-primary">
      {/* Subtle grid background */}
      <div className="fixed inset-0 bg-[linear-gradient(to_right,#27272a_1px,transparent_1px),linear-gradient(to_bottom,#27272a_1px,transparent_1px)] bg-[size:4rem_4rem] opacity-20" />
      
      <div className="relative z-10 container mx-auto px-4 py-12 max-w-7xl">
        {/* Header */}
        <header className="mb-12 animate-slide-down">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-1 h-12 bg-gradient-to-b from-accent-blue to-transparent rounded-full" />
            <div>
              <h1 className="text-4xl font-bold tracking-tight text-text-primary mb-1">
                C++ Format Checker
              </h1>
              <p className="text-text-secondary text-sm font-medium">
                ME 101 Style Guide Validator
              </p>
            </div>
          </div>
          
          <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono ml-6">
            <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse" />
            <span>Real-time analysis</span>
            <span className="text-border-accent">•</span>
            <span>Comprehensive checks</span>
            <span className="text-border-accent">•</span>
            <span>Instant feedback</span>
          </div>
        </header>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Code Editor Panel */}
          <div className="group animate-fade-in">
            <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border-primary hover:border-border-secondary transition-colors duration-300">
              {/* Editor Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-bg-tertiary border-b border-border-primary">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-accent-red/80" />
                    <div className="w-3 h-3 rounded-full bg-accent-amber/80" />
                    <div className="w-3 h-3 rounded-full bg-accent-green/80" />
                  </div>
                  <span className="text-xs font-mono text-text-tertiary ml-2">main.cpp</span>
                </div>
                <div className="flex items-center gap-2 text-xs text-text-tertiary font-mono">
                  <span className="hidden sm:inline">C++</span>
                  <span className="text-border-accent">•</span>
                  <span>{code.split('\n').length} lines</span>
                </div>
              </div>
              
              {/* Code Input */}
              <div className="relative flex bg-bg-secondary">
                {/* Line Numbers */}
                <div 
                  ref={lineNumbersRef}
                  className="select-none overflow-hidden bg-bg-tertiary text-text-tertiary text-right pr-3 py-6 font-mono text-sm leading-6 border-r border-border-primary"
                  style={{ width: '3.5rem', height: '500px' }}
                >
                  {lineNumbers.map((num) => (
                    <div key={`line-${num}`} className="px-2">{num}</div>
                  ))}
                </div>
                
                {/* Code Textarea */}
                <textarea
                  ref={textareaRef}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  onScroll={handleScroll}
                  onKeyDown={handleKeyDown}
                  placeholder="// Paste your C++ code here...
#include <iostream>
using namespace std;

int main() {
    // Your code
    return 0;
}"
                  className="flex-1 h-[500px] bg-transparent text-text-primary 
                             font-mono text-sm py-6 px-4 resize-none focus:outline-none
                             placeholder:text-text-tertiary leading-6 whitespace-pre overflow-x-auto"
                  spellCheck={false}
                  wrap="off"
                />
              </div>
              
              {/* Action Buttons */}
              <div className="p-4 bg-bg-tertiary border-t border-border-primary flex gap-3">
                <button
                  onClick={handleCheck}
                  disabled={!code.trim()}
                  className="flex-1 bg-text-primary text-bg-primary font-medium py-2.5 px-5 rounded-lg text-sm
                             hover:bg-text-secondary disabled:opacity-40 disabled:cursor-not-allowed
                             transition-all duration-200 active:scale-95 disabled:active:scale-100"
                >
                  Check Format
                </button>
                <button
                  onClick={handleClear}
                  className="bg-bg-elevated text-text-secondary border border-border-primary
                             font-medium py-2.5 px-5 rounded-lg text-sm
                             hover:bg-bg-secondary hover:border-border-secondary hover:text-text-primary
                             transition-all duration-200 active:scale-95"
                >
                  Clear
                </button>
              </div>
            </div>
          </div>

          {/* Results Panel */}
          <div className="animate-fade-in" style={{ animationDelay: '100ms' }}>
            <div className="bg-bg-secondary rounded-xl overflow-hidden border border-border-primary hover:border-border-secondary transition-colors duration-300 h-full">
              {/* Results Header */}
              <div className="flex items-center justify-between px-4 py-3 bg-bg-tertiary border-b border-border-primary">
                <span className="text-xs font-mono text-text-tertiary">Results</span>
                <div className="flex items-center gap-2 text-xs font-mono text-text-tertiary">
                  {hasChecked && (
                    <>
                      <span className={errors.length === 0 ? 'text-accent-green' : 'text-accent-amber'}>
                        {errors.length === 0 ? 'Perfect' : `${errors.length} issues`}
                      </span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Results Content */}
              <div className="h-[500px] overflow-y-auto p-6 custom-scrollbar">
                {!hasChecked ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12">
                    <div className="w-16 h-16 rounded-2xl bg-bg-tertiary border border-border-primary flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-text-tertiary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"/>
                      </svg>
                    </div>
                    <h3 className="text-sm font-medium text-text-primary mb-1">Ready to analyze</h3>
                    <p className="text-xs text-text-tertiary max-w-xs">
                      Paste your C++ code and click "Check Format" to validate against ME 101 style guidelines
                    </p>
                  </div>
                ) : errors.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full text-center py-12 animate-scale-in">
                    <div className="w-16 h-16 rounded-2xl bg-accent-green/10 border border-accent-green/20 flex items-center justify-center mb-4">
                      <svg className="w-8 h-8 text-accent-green" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-text-primary mb-1">Perfect formatting</h3>
                    <p className="text-sm text-text-secondary">No issues found in your code</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Summary */}
                    <div className="bg-bg-tertiary rounded-lg p-4 border border-border-primary">
                      <h3 className="text-sm font-semibold text-text-primary mb-3">
                        Found {errors.length} {errors.length === 1 ? 'issue' : 'issues'}
                      </h3>
                      <div className="flex flex-wrap gap-3 text-xs">
                        {warnings.length > 0 && (
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <div className="w-2 h-2 rounded-full bg-accent-amber" />
                            <span>{warnings.length} warning{warnings.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                        {infos.length > 0 && (
                          <div className="flex items-center gap-1.5 text-text-secondary">
                            <div className="w-2 h-2 rounded-full bg-accent-blue" />
                            <span>{infos.length} suggestion{infos.length !== 1 ? 's' : ''}</span>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Error List */}
                    {errors.map((error, idx) => (
                      <div
                        key={idx}
                        className={`bg-bg-tertiary rounded-lg p-4 border-l-2 hover:bg-bg-elevated transition-colors duration-200 animate-slide-up ${
                          error.severity === 'warning' 
                            ? 'border-accent-amber' 
                            : 'border-accent-blue'
                        }`}
                        style={{ animationDelay: `${idx * 30}ms` }}
                      >
                        <div className="flex items-start gap-3 mb-2">
                          <div className={`flex-shrink-0 w-6 h-6 rounded flex items-center justify-center text-xs font-bold ${
                            error.severity === 'warning'
                              ? 'bg-accent-amber/10 text-accent-amber'
                              : 'bg-accent-blue/10 text-accent-blue'
                          }`}>
                            {error.line}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-text-primary mb-1">
                              {error.rule}
                            </div>
                            <p className="text-xs text-text-secondary leading-relaxed">
                              {error.message}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.5s ease-out;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }

        .custom-scrollbar::-webkit-scrollbar-track {
          background: var(--bg-tertiary);
        }

        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: var(--border-secondary);
          border-radius: 3px;
        }

        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: var(--border-accent);
        }
      `}</style>
    </main>
  )
}