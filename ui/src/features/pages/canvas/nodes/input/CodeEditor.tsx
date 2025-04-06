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

interface CodeEditorNodeProps {
  id: string;
  data: {
    code?: string;
    language?: string;
    label?: string;
    out?: any;
  };
}

const CodeEditorNode: React.FC<CodeEditorNodeProps> = ({ id, data }) => {
  const { updateNodeData } = useReactFlow();
  const [language, setLanguage] = useState<string>(data.language || 'python');
  const [code, setCode] = useState<string>(data.code || '');

  // This callback is triggered once the editor is mounted.
  // Register language definitions and autocomplete providers.
  const editorDidMount: EditorDidMount = (editor, monacoInstance: any) => {
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

  const headerLabel =
    data.label && data.label.trim() ? data.label : 'Code Editor';

  return (
    <W3CNode id={id} label={headerLabel} isGood={true} isResizeable={true} minWidth={550} minHeight={600} style={{ width: 550, height: 600 }}>
      <div style={{ padding: 10, textAlign: 'left', width: '100%', height: '100%' }}>
        <div style={{ marginBottom: 5 }}>
          <label style={{ marginRight: 5 }}>Language:</label>
          <select value={language} onChange={onLanguageChange}>
            <option value="python">Python</option>
            <option value="csharp">C#</option>
            {/* Add more languages as needed */}
          </select>
        </div>
        <MonacoEditor
          height="90%"
          width="100%"
          language={language}
          theme="vs-light"
          value={code}
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

export default CodeEditorNode;
