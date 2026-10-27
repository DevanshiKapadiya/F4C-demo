import {
  ClassicEditor,
  Context,
  Bold,
  Essentials,
  Italic,
  Paragraph,
  Underline,
  Strikethrough,
  BlockQuote,
  Image,
  Link,
  List,
  Table,
  Code,
  Heading,
  HorizontalLine,
  SpecialCharacters,
  ContextWatchdog,
  AccessibilityHelp,
  Autoformat,
  AutoImage,
  AutoLink,
  Autosave,
  CodeBlock,
  GeneralHtmlSupport,
  HtmlEmbed,
  ImageBlock,
  ImageCaption,
  ImageInline,
  ImageInsertViaUrl,
  ImageResize,
  ImageStyle,
  ImageTextAlternative,
  ImageToolbar,
  LinkImage,
  ListProperties,
  SelectAll,
  ShowBlocks,
  TableCaption,
  TableCellProperties,
  TableColumnResize,
  TableProperties,
  TableToolbar,
  TextTransformation,
  TodoList,
  Undo,
  SourceEditing,
  Alignment
} from 'ckeditor5';
import { CKEditor, CKEditorContext } from '@ckeditor/ckeditor5-react';
import { useRef, useEffect } from 'react';

import 'ckeditor5/ckeditor5.css';

function Ckeditor({ InitialData, setData, editorRef }) {
  const localEditorRef = useRef();

  useEffect(() => {
    if (editorRef && localEditorRef.current) {
      editorRef.current = localEditorRef.current;
    }
  }, [editorRef]);

  const editorConfig = {
    toolbar: {
      items: [
        'heading',
        '|',
        'bold',
        'italic',
        'Strikethrough',
        'Underline',
        'code',
        '|',
        'Alignment',
        '|',
        'link',
        'insertImageViaUrl',
        'insertTable',
        '|',
        'bulletedList',
        'numberedList',
        '|',
        'todoList',
        'undo',
        'redo',
        '|',
        'sourceEditing',
        '|'
      ],
      shouldNotGroupWhenFull: false
    },
    plugins: [
      AccessibilityHelp,
      Autoformat,
      AutoImage,
      AutoLink,
      Autosave,
      Bold,
      Code,
      CodeBlock,
      Essentials,
      GeneralHtmlSupport,
      Heading,
      HtmlEmbed,
      ImageBlock,
      ImageCaption,
      ImageInline,
      ImageInsertViaUrl,
      ImageResize,
      ImageStyle,
      ImageTextAlternative,
      ImageToolbar,
      Italic,
      Link,
      LinkImage,
      List,
      ListProperties,
      Paragraph,
      SelectAll,
      ShowBlocks,
      Table,
      TableCaption,
      TableCellProperties,
      TableColumnResize,
      TableProperties,
      TableToolbar,
      TextTransformation,
      TodoList,
      Undo,
      Strikethrough,
      Underline,
      SourceEditing,
      Alignment
    ],
    heading: {
      options: [
        {
          model: 'paragraph',
          title: 'Paragraph',
          class: 'ck-heading_paragraph'
        },
        {
          model: 'heading1',
          view: 'h1',
          title: 'Heading 1',
          class: 'ck-heading_heading1'
        },
        {
          model: 'heading2',
          view: 'h2',
          title: 'Heading 2',
          class: 'ck-heading_heading2'
        },
        {
          model: 'heading3',
          view: 'h3',
          title: 'Heading 3',
          class: 'ck-heading_heading3'
        },
        {
          model: 'heading4',
          view: 'h4',
          title: 'Heading 4',
          class: 'ck-heading_heading4'
        },
        {
          model: 'heading5',
          view: 'h5',
          title: 'Heading 5',
          class: 'ck-heading_heading5'
        },
        {
          model: 'heading6',
          view: 'h6',
          title: 'Heading 6',
          class: 'ck-heading_heading6'
        }
      ]
    },
    htmlSupport: {
      allow: [
        {
          name: /^.*$/,
          styles: true,
          attributes: true,
          classes: true
        }
      ]
    },
    image: {
      toolbar: [
        'toggleImageCaption',
        'imageTextAlternative',
        '|',
        'imageStyle:inline',
        'imageStyle:wrapText',
        'imageStyle:breakText',
        '|',
        'resizeImage'
      ]
    },
    initialData: InitialData,
    link: {
      addTargetToExternalLinks: true,
      defaultProtocol: 'https://',
      decorators: {
        toggleTarget: {
          mode: 'manual',
          label: 'Target',
          attributes: {
            target: '_blank'
          }
        }
      }
    },
    list: {
      properties: {
        styles: true,
        startIndex: true,
        reversed: true
      }
    },
    placeholder: 'Type your content here!',
    table: {
      contentToolbar: ['tableColumn', 'tableRow', 'mergeTableCells', 'tableProperties', 'tableCellProperties']
    }
  };

  return (
    <CKEditorContext
      context={Context}
      contextWatchdog={ContextWatchdog}
      // onChangeInitializedEditors={(editors) => {
      //   console.info(editors.editor1?.instance, editors.editor1?.yourAdditionalData);
      // }}
    >
      <CKEditor
        editor={ClassicEditor}
        config={editorConfig}
        data={InitialData}
        onReady={(editor) => {
          localEditorRef.current = editor;
          if (editorRef) {
            editorRef.current = editor;
          }
        }}
        onChange={(event, editor) => {
          const data = editor.getData();
          setData(data);
        }}
      />
    </CKEditorContext>
  );
}

export default Ckeditor;
