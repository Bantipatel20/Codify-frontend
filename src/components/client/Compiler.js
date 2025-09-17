// src/components/client/Compiler.js
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
  import { HiPlay, HiUpload,  HiArrowLeft,  HiChevronDown, HiCheck, HiBookOpen, HiClipboardList, HiTerminal } from 'react-icons/hi';
import axios from 'axios';

const Compiler = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const problem = state?.problem;
  const dropdownRef = useRef(null);

  // Language and code states
  const [languages, setLanguages] = useState([]);
  const [selectedLanguage, setSelectedLanguage] = useState('cpp');
  const [code, setCode] = useState('');
  const [output, setOutput] = useState('');
  const [error, setError] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [activeBottomTab, setActiveBottomTab] = useState('testcase');
  const [showLanguageDropdown, setShowLanguageDropdown] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced code templates with better starting code
  const codeTemplates = useCallback(() => ({
    cpp: `class FoodRatings {
public:
    FoodRatings(vector<string>& foods, vector<string>& cuisines, vector<int>& ratings) {
        
    }
    
    void changeRating(string food, int newRating) {
        
    }
    
    string highestRated(string cuisine) {
        
    }
};`,

    javascript: `/**
 * @param {string[]} foods
 * @param {string[]} cuisines
 * @param {number[]} ratings
 */
var FoodRatings = function(foods, cuisines, ratings) {
    
};

/** 
 * @param {string} food
 * @param {number} newRating
 * @return {void}
 */
FoodRatings.prototype.changeRating = function(food, newRating) {
    
};

/** 
 * @param {string} cuisine
 * @return {string}
 */
FoodRatings.prototype.highestRated = function(cuisine) {
    
};`,

    python: `class FoodRatings:

    def __init__(self, foods: List[str], cuisines: List[str], ratings: List[int]):
        

    def changeRating(self, food: str, newRating: int) -> None:
        

    def highestRated(self, cuisine: str) -> str:
        `,

    java: `class FoodRatings {

    public FoodRatings(String[] foods, String[] cuisines, int[] ratings) {
        
    }
    
    public void changeRating(String food, int newRating) {
        
    }
    
    public String highestRated(String cuisine) {
        
    }
}`,

    c: `typedef struct {
    
} FoodRatings;


FoodRatings* foodRatingsCreate(char ** foods, int foodsSize, char ** cuisines, int cuisinesSize, int* ratings, int ratingsSize) {
    
}

void foodRatingsChangeRating(FoodRatings* obj, char * food, int newRating) {
    
}

char * foodRatingsHighestRated(FoodRatings* obj, char * cuisine) {
    
}

void foodRatingsFree(FoodRatings* obj) {
    
}`,

    go: `type FoodRatings struct {
    
}


func Constructor(foods []string, cuisines []string, ratings []int) FoodRatings {
    
}


func (this *FoodRatings) ChangeRating(food string, newRating int)  {
    
}


func (this *FoodRatings) HighestRated(cuisine string) string {
    
}`,

    ruby: `class FoodRatings

=begin
    :type foods: String[]
    :type cuisines: String[]
    :type ratings: Integer[]
=end
    def initialize(foods, cuisines, ratings)
        
    end


=begin
    :type food: String
    :type new_rating: Integer
    :rtype: Void
=end
    def change_rating(food, new_rating)
        
    end


=begin
    :type cuisine: String
    :rtype: String
=end
    def highest_rated(cuisine)
        
    end


end`,

    php: `class FoodRatings {
    /**
     * @param String[] $foods
     * @param String[] $cuisines
     * @param Integer[] $ratings
     */
    function __construct($foods, $cuisines, $ratings) {
        
    }
  
    /**
     * @param String $food
     * @param Integer $newRating
     * @return NULL
     */
    function changeRating($food, $newRating) {
        
    }
  
    /**
     * @param String $cuisine
     * @return String
     */
    function highestRated($cuisine) {
        
    }
}`
  }), []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setShowLanguageDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Fetch available languages on component mount
  useEffect(() => {
    const fetchLanguages = async () => {
      try {
        console.log('🔄 Attempting to fetch languages from local server...');
        const response = await axios.get('/api/compile/languages');
        if (response.data.success) {
          console.log('✅ Successfully fetched languages from local server:', response.data.data.languages);
          setLanguages(response.data.data.languages);
        }
      } catch (err) {
        console.error('❌ Failed to fetch languages from local server:', err);
        console.log('🔄 Using fallback languages...');
        setLanguages([
          { name: 'C++', key: 'cpp', version: 'GCC 9.2.0' },
          { name: 'Java', key: 'java', version: 'OpenJDK 13.0.1' },
          { name: 'Python3', key: 'python', version: '3.8.1' },
          { name: 'C', key: 'c', version: 'GCC 9.2.0' },
          { name: 'C#', key: 'csharp', version: 'Mono 6.6.0.161' },
          { name: 'JavaScript', key: 'javascript', version: 'Node.js 12.14.0' },
          { name: 'Ruby', key: 'ruby', version: '2.7.0' },
          { name: 'Swift', key: 'swift', version: '5.1.3' },
          { name: 'Go', key: 'go', version: '1.13.5' },
          { name: 'Scala', key: 'scala', version: '2.13.1' },
          { name: 'Kotlin', key: 'kotlin', version: '1.3.61' },
          { name: 'Rust', key: 'rust', version: '1.40.0' },
          { name: 'PHP', key: 'php', version: '7.4.1' },
          { name: 'TypeScript', key: 'typescript', version: '3.7.4' },
          { name: 'Racket', key: 'racket', version: '7.5' },
          { name: 'Erlang', key: 'erlang', version: 'OTP 22.2' }
        ]);
      }
    };

    fetchLanguages();
  }, []);

  // Set initial code template when language changes (but not on initial load)
  useEffect(() => {
    if (isInitialized) {
      const templates = codeTemplates();
      if (selectedLanguage && templates[selectedLanguage]) {
        setCode(templates[selectedLanguage]);
      }
    }
  }, [selectedLanguage, codeTemplates, isInitialized]);

  // Set initial language and code (only runs once when languages are loaded)
  useEffect(() => {
    if (languages.length > 0 && !isInitialized) {
      const templates = codeTemplates();
      const defaultLang = languages.find(lang => lang.key === 'cpp') || languages[0];
      console.log('🚀 Setting initial language:', defaultLang);
      setSelectedLanguage(defaultLang.key);
      setCode(templates[defaultLang.key] || '// Write your code here');
      setIsInitialized(true);
    }
  }, [languages, codeTemplates, isInitialized]);

  const handleLanguageChange = (languageKey) => {
    console.log('🔄 Changing language to:', languageKey);
    const templates = codeTemplates();
    setSelectedLanguage(languageKey);
    setCode(templates[languageKey] || '// Write your code here');
    setShowLanguageDropdown(false);
    setOutput('');
    setError('');
  };

  const handleRun = async () => {
    setError('');
    setOutput('');
    setIsRunning(true);
    setActiveBottomTab('result');

    try {
      console.log('▶️ Running code with language:', selectedLanguage);
      
      const requestData = {
        lang: selectedLanguage,
        code: code,
        input: ''
      };
      
      const response = await axios.post('/api/compile', requestData);
      
      if (response.data && response.data.success === true) {
        const output = response.data.data?.output || 
                      response.data.data?.result || 
                      response.data.data?.stdout || 
                      'Code executed successfully';
        
        setOutput(output);
      } else {
        const errorMsg = response.data?.stderr ||  
                        response.data?.error || 
                        response.data?.message || 
                        'Compilation failed';
        
        setError(errorMsg);
      }
    } catch (err) {
      console.error('❌ Compilation error:', err);
      let errorMessage = 'Failed to compile code';
      
      if (err.response?.data?.stderr) {
        errorMessage = err.response.data.stderr;
      } else if (err.response?.data?.error) {
        errorMessage = err.response.data.error;
      } else if (err.message) {
        errorMessage = err.message;
      }
      
      setError(errorMessage);
    } finally {
      setIsRunning(false);
    }
  };

  const handleSubmit = async () => {
    setError('');
    setOutput('');
    setIsRunning(true);
    setActiveBottomTab('result');

    try {
      const compileResponse = await axios.post('/api/compile', {
        lang: selectedLanguage,
        code: code,
        input: ''
      });

      if (compileResponse.data && compileResponse.data.success === true) {
        const compilationOutput = compileResponse.data.data?.output || 'Code executed successfully';

        try {
          const submitResponse = await axios.post('/api/submit', {
            code,
            language: selectedLanguage,
            problemId: problem?.id || 2353,
            output: compilationOutput
          });
          
          const status = submitResponse.data?.status || 'Submitted successfully';
          setOutput('🎉 Submission Status: ' + status);
        } catch (submitErr) {
          setOutput('✅ Code compiled successfully:\n' + compilationOutput);
        }
      } else {
        const errorMsg = compileResponse.data?.stderr || 'Compilation failed';
        setError(errorMsg);
      }
    } catch (err) {
      setError('Failed to submit code: ' + (err.response?.data?.stderr || err.message));
    } finally {
      setIsRunning(false);
    }
  };

  const getLanguageIcon = (languageKey) => {
    const icons = {
      cpp: '⚡',
      java: '☕',
      python: '🐍',
      c: '🔧',
      csharp: '💙',
      javascript: '🟨',
      ruby: '💎',
      swift: '🚀',
      go: '🐹',
      scala: '🎯',
      kotlin: '🟣',
      rust: '🦀',
      php: '🐘',
      typescript: '🔷',
      racket: '🎾',
      erlang: '📡'
    };
    return icons[languageKey] || '📝';
  };

  const selectedLangObj = languages.find(lang => lang.key === selectedLanguage);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <button 
              onClick={() => navigate('/client/practice')}
              className="flex items-center space-x-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              <HiArrowLeft className="text-lg" />
              <span>Back</span>
            </button>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                2353. Design a Food Rating System
              </h1>
              <span className="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200 text-xs font-medium rounded">
                Medium
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-73px)]">
        {/* Left Panel - Problem Description */}
        <div className="w-1/2 bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col">
          {/* Single Tab */}
          <div className="flex border-b border-gray-200 dark:border-gray-700">
            <button className="flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 border-blue-500 text-blue-600 dark:text-blue-400">
              <HiBookOpen className="text-lg" />
              <span>Description</span>
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-6">
            <div className="space-y-6">
              <div>
                <p className="text-gray-700 dark:text-gray-300 leading-relaxed">
                  Design a food rating system that can do the following:
                </p>
                <ul className="mt-4 space-y-2 text-gray-700 dark:text-gray-300">
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span><strong>Modify</strong> the rating of a food item listed in the system.</span>
                  </li>
                  <li className="flex items-start">
                    <span className="font-semibold mr-2">•</span>
                    <span>Return the highest-rated food item for a type of cuisine in the system.</span>
                  </li>
                </ul>
                <p className="mt-4 text-gray-700 dark:text-gray-300">
                  Implement the <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">FoodRatings</code> class:
                </p>
              </div>

              <div className="space-y-4">
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                      FoodRatings(String[] foods, String[] cuisines, int[] ratings)
                    </code> Initializes the system. The food items are described by <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">foods</code>, <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">cuisines</code>, and <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">ratings</code>, all of which have a length of <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">n</code>.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                      void changeRating(String food, int newRating)
                    </code> Changes the rating of the food item with the name <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">food</code>.
                  </p>
                </div>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <p className="text-gray-700 dark:text-gray-300">
                    <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">
                      String highestRated(String cuisine)
                    </code> Returns the name of the food item that has the highest rating for the given type of <code className="bg-gray-100 dark:bg-gray-700 px-1 py-0.5 rounded text-sm">cuisine</code>. If there is a tie, return the item with the <strong>lexicographically smaller</strong> name.
                  </p>
                </div>
              </div>

              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-3">Example 1:</h3>
                <div className="bg-gray-50 dark:bg-gray-900 rounded-lg p-4">
                  <pre className="text-sm text-gray-700 dark:text-gray-300">
{`["FoodRatings","highestRated","highestRated","changeRating","highestRated","changeRating","highestRated"]
[[["kimchi","miso","sushi","moussaka","ramen","bulgogi"],
["korean","japanese","japanese","greek","japanese","korean"],[9,12,8,15,14,7]],
["korean"],["japanese"],["sushi",16],["japanese"],["ramen",16],["japanese"]]`}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Panel - Code Editor */}
        <div className="w-1/2 bg-white dark:bg-gray-800 flex flex-col">
          {/* Editor Header */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center space-x-4">
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Code</h2>
              
              {/* Language Selector */}
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    setShowLanguageDropdown(!showLanguageDropdown);
                  }}
                  className="flex items-center space-x-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 text-gray-900 dark:text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <span>{getLanguageIcon(selectedLanguage)}</span>
                  <span>{selectedLangObj?.name || 'C++'}</span>
                  <HiChevronDown className={`text-sm transition-transform duration-300 ${showLanguageDropdown ? 'rotate-180' : ''}`} />
                </button>

                {/* Language Dropdown */}
                {showLanguageDropdown && (
                  <div className="absolute top-full left-0 mt-2 w-64 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg shadow-lg z-50 max-h-80 overflow-y-auto">
                    {languages.map((lang) => (
                      <button
                        key={lang.key}
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          handleLanguageChange(lang.key);
                        }}
                        className={`w-full flex items-center space-x-3 px-4 py-3 text-left hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors ${
                          selectedLanguage === lang.key ? 'bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-400' : 'text-gray-900 dark:text-white'
                        }`}
                      >
                        <span>{getLanguageIcon(lang.key)}</span>
                        <div className="flex-1">
                          <div className="font-medium">{lang.name}</div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">{lang.version}</div>
                        </div>
                        {selectedLanguage === lang.key && (
                          <HiCheck className="text-blue-600 dark:text-blue-400" />
                        )}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Code Editor */}
          <div className="flex-1 relative">
            <textarea
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full h-full bg-white dark:bg-gray-900 text-gray-900 dark:text-white font-mono text-sm p-4 resize-none focus:outline-none border-none"
              placeholder={`Write your ${selectedLangObj?.name || 'C++'} solution here...`}
              spellCheck={false}
              style={{ fontFamily: 'Monaco, Menlo, "Ubuntu Mono", monospace' }}
            />
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 dark:text-gray-400">
              Ln 1, Col 1
            </div>
          </div>

          {/* Bottom Panel */}
          <div className="border-t border-gray-200 dark:border-gray-700">
            {/* Bottom Tabs */}
            <div className="flex items-center justify-between px-4 py-2 bg-gray-50 dark:bg-gray-900">
              <div className="flex">
                <button 
                  onClick={() => setActiveBottomTab('testcase')}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    activeBottomTab === 'testcase' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <HiClipboardList className="text-sm" />
                  <span>Testcase</span>
                </button>
                <button 
                  onClick={() => setActiveBottomTab('result')}
                  className={`flex items-center space-x-2 px-3 py-2 text-sm font-medium rounded transition-colors ${
                    activeBottomTab === 'result' 
                      ? 'bg-white dark:bg-gray-800 text-gray-900 dark:text-white shadow-sm' 
                      : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                  }`}
                >
                  <HiTerminal className="text-sm" />
                  <span>Test Result</span>
                </button>
              </div>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleRun}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 text-gray-900 dark:text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <HiPlay className="text-sm" />
                  <span>{isRunning ? 'Running...' : 'Run'}</span>
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isRunning}
                  className="flex items-center space-x-2 bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white px-3 py-2 rounded text-sm transition-colors"
                >
                  <HiUpload className="text-sm" />
                  <span>{isRunning ? 'Submitting...' : 'Submit'}</span>
                </button>
              </div>
            </div>

            {/* Bottom Content */}
            <div className="h-48 p-4 bg-white dark:bg-gray-800 overflow-y-auto">
              {activeBottomTab === 'testcase' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-medium text-gray-900 dark:text-white">Case 1</h3>
                    <button className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                      +
                    </button>
                  </div>
                  <div className="bg-gray-50 dark:bg-gray-900 rounded p-3">
                    <pre className="text-xs text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
{`["FoodRatings","highestRated","highestRated","changeRating","highestRated","changeRating","highestRated"]

[["kimchi","miso","sushi","moussaka","ramen","bulgogi"],
["korean","japanese","japanese","greek","japanese","korean"],[9,12,8,15,14,7]],
["korean"],["japanese"],["sushi",16],["japanese"],["ramen",16],["japanese"]]`}
                    </pre>
                  </div>
                </div>
              )}
              
              {activeBottomTab === 'result' && (
                <div>
                  {isRunning ? (
                    <div className="flex items-center space-x-2 text-blue-600 dark:text-blue-400">
                      <div className="animate-spin w-4 h-4 border-2 border-blue-600 dark:border-blue-400 border-t-transparent rounded-full"></div>
                      <span className="text-sm">Running your code...</span>
                    </div>
                  ) : (
                    <div className="text-sm">
                      {error && (
                        <div className="text-red-600 dark:text-red-400 whitespace-pre-wrap font-mono">
                          {error}
                        </div>
                      )}
                      {output && (
                        <div className="text-green-600 dark:text-green-400 whitespace-pre-wrap font-mono">
                          {output}
                        </div>
                      )}
                      {!error && !output && (
                        <div className="text-gray-500 dark:text-gray-400">
                          You must run your code first
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Compiler;
