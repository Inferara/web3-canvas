import React, { useState, useCallback } from 'react';
import MonacoEditor, { EditorDidMount } from 'react-monaco-editor';
import { Position, useReactFlow } from '@xyflow/react';
import W3CNode from '../../common/W3CNode';
import LabeledHandle from '../../common/LabeledHandle';

// Import Monaco’s CSS (ensure it's imported in your main entry file too)
import 'monaco-editor/min/vs/editor/editor.main.css';

// Import language definitions for Python and C#
import * as monaco from 'monaco-editor/esm/vs/editor/editor.api';
import { language as pythonLang } from 'monaco-editor/esm/vs/basic-languages/python/python';
import { language as csharpLang } from 'monaco-editor/esm/vs/basic-languages/csharp/csharp';
import { Utf8DataTransfer } from '../../utils/Utf8DataTransfer';
import { Button } from '@mui/material';
import { createAgentCall } from '../../../../../api/w3c/w3c-api';
import { AgentItem } from '../../../../../api/w3c/models/agent';
import { AgentType } from '../../../../../api/w3c/models/agent-type';

interface CodeAgentNodeProps {
  id: string;
  data: {
    description: string;
    outDescription: string;
    code?: string;
    language?: string;
    label?: string;
    out?: any;
  };
}

const DefaultCsharpCode = `using System;
using System.Collections.Generic;

class Agent {
    public string Run(
        Dictionary<string, string> Parameters,
        AiCoreApi.Common.RequestAccessor RequestAccessor,
        AiCoreApi.Common.ResponseAccessor ResponseAccessor,
        Func<string, List<string>?, string> ExecuteAgent,
        Func<string, string> GetCacheValue,
        Func<string, string, int, string> SetCacheValue
    )
    {
        return "Hello W3C";
    }
}
`;

const DefaultPythonCode = `
def run_agent(parameters, request_accessor, response_accessor, execute_agent, get_cache_value, set_cache_value):
    return "Hello W3C"
`;

const DefaultCodeDictionary = {
  csharp: DefaultCsharpCode,
  python: DefaultPythonCode,
};

const CodeAgent: React.FC<CodeAgentNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [language, setLanguage] = useState<string>(data.language || 'csharp');
  const [code, setCode] = useState<string>(data.code || DefaultCodeDictionary[language]);

  // This callback is triggered once the editor is mounted.
  // Register language definitions and autocomplete providers.
  const editorDidMount: EditorDidMount = (_editor, monacoInstance: any) => {
    // Register language definitions if not already registered
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'python')) {
      monaco.languages.register({ id: 'python' });
      monaco.languages.setMonarchTokensProvider('python', pythonLang as monaco.languages.IMonarchLanguage);
    }
    if (!monaco.languages.getLanguages().find(lang => lang.id === 'csharp')) {
      monaco.languages.register({ id: 'csharp' });
      monaco.languages.setMonarchTokensProvider('csharp', csharpLang as monaco.languages.IMonarchLanguage);
    }

    // Register autocomplete for Python
    monacoInstance.languages.registerCompletionItemProvider('python', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'print',
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: 'print(${1:"Hello, world!"})',
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation: 'Prints a message to the console',
          },
        ];
        return { suggestions };
      },
    });

    // Register autocomplete for C#
    monacoInstance.languages.registerCompletionItemProvider('csharp', {
      provideCompletionItems: () => {
        const suggestions = [
          {
            label: 'Console.WriteLine',
            kind: monacoInstance.languages.CompletionItemKind.Function,
            insertText: 'Console.WriteLine($1);',
            insertTextRules:
              monacoInstance.languages.CompletionItemInsertTextRule.InsertAsSnippet,
            documentation:
              'Writes the specified data, followed by the current line terminator, to the standard output stream.',
          },
        ];
        return { suggestions };
      },
    });
  };

  const onLanguageChange = useCallback(
    (event: React.ChangeEvent<HTMLSelectElement>) => {
      const newLanguage = event.target.value;
      setLanguage(newLanguage);
      updateNodeData(id, { ...data, language: newLanguage });
    },
    [id, data, code, updateNodeData]
  );

  const onEditorChange = useCallback(
    (newValue: string) => {
      setCode(newValue);
      const newOut = Utf8DataTransfer.encodeString(newValue);
      updateNodeData(id, { ...data, code: newValue, out: newOut });
    },
    [id, data, language, updateNodeData]
  );

  const editorOptions = {
    selectOnLineNumbers: true,
    automaticLayout: true,
    minimap: {
      enabled: false, // hides the minimap
    },
  };

  const onCreateAgent = async () => {
    const agentItem: AgentItem = {
      agentId: 0,
      isEnabled: true,
      name: data.label || 'Unnamed Agent',
      description: data.description || 'No description provided',
      type: AgentType.CsharpCode,
      content: {},
      tags: [],
      version: 1,
    };
    const res = await createAgentCall(agentItem); 
    if (res) {
      console.log('Agent created successfully');
    } else {
      console.error('Failed to create agent');
    }
  }

  const onTestAgent = async () => {
    console.log('Test agent');
  };

  const headerLabel =
    data.label && data.label.trim() ? data.label : 'Code Agent';

  return (
    <W3CNode id={id} label={headerLabel} isGood={true} isResizeable={true} minWidth={550} minHeight={600} style={{ width: 550, height: 600 }}>
      <div style={{ padding: 10, textAlign: 'left', width: '100%', height: '100%' }}>
        <div style={{ marginBottom: 5 }}>
          <label style={{ marginRight: 5 }}>Language:</label>
          <select value={language} onChange={onLanguageChange}>
            <option value="csharp">C#</option>
            <option value="python">Python</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <div style={{ marginBottom: 5 }}>
          <label style={{ marginRight: 5 }}>Name:</label>
          <input
            type="text"
            value={data.label || ''}
            onChange={(event) => {
              const newLabel = event.target.value;
              updateNodeData(id, { ...data, label: newLabel });
            }}
            style={{ width: '50%' }}
          />
        </div>
        <div style={{ display: 'flex', marginBottom: 5 }}>
        <Button variant="text" onClick={onCreateAgent}>Create</Button>
        <Button variant="text" onClick={onTestAgent}>Test</Button>
          <div style={{ display: 'flex' }}>
            <label style={{ marginRight: 5 }}>Description:</label>
            <textarea
              value={data.description || ''}
              onChange={(event) => {
                const newDescription = event.target.value;
                updateNodeData(id, { ...data, description: newDescription });
              }}
              style={{ width: '50%', height: '60px', backgroundColor: '#f8f8f8' }}
            />
          </div>
          <div style={{ display: 'flex' }}>
            <label style={{ marginRight: 5 }}>Output Description:</label>
            <textarea
              value={data.out?.outDescription || ''}
              onChange={(event) => {
                const newOutputDescription = event.target.value;
                updateNodeData(id, { ...data, out: { ...data, outDescription: newOutputDescription } });
              }}
              style={{ width: '50%', height: '60px', backgroundColor: '#f8f8f8' }}
            />
          </div>
        </div>
        <MonacoEditor
          height="75%"
          width="100%"
          language={language}
          theme="vs-light"
          value={code ?? (language === 'csharp' ? DefaultCsharpCode : '')}
          className="nodrag"
          options={editorOptions}
          onChange={onEditorChange}
          editorDidMount={editorDidMount}
        />
      </div>
      <LabeledHandle label="in" type="target" position={Position.Left} id="input" />
      <LabeledHandle label="out" type="source" position={Position.Right} id="code" />
    </W3CNode>
  );
};

export default CodeAgent;
