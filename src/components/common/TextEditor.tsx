import { RichTextEditor } from '@mantine/tiptap';
import { Editor } from '@tiptap/react';

interface textEditorProps {
  editor: Editor | null;
}
export default function TextEditor({ editor }: textEditorProps) {
  if (!editor) return null;
  return (
    <RichTextEditor
      editor={editor}
      sx={{
        minHeight: 300,
        borderColor: '#B82C67',
        '.mantine-nlxhsk': {
          borderBottom: '0.0625rem solid #B82C67',
        },
        '.ProseMirror': {
          minHeight: 300,
        },
      }}
    >
      <RichTextEditor.Toolbar sticky stickyOffset={60}>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.Bold />
          <RichTextEditor.Italic />
          <RichTextEditor.Underline />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.BulletList />
          <RichTextEditor.OrderedList />
        </RichTextEditor.ControlsGroup>
        <RichTextEditor.ControlsGroup>
          <RichTextEditor.AlignLeft />
          <RichTextEditor.AlignCenter />
          <RichTextEditor.AlignJustify />
          <RichTextEditor.AlignRight />
        </RichTextEditor.ControlsGroup>
      </RichTextEditor.Toolbar>
      <RichTextEditor.Content />
    </RichTextEditor>
  );
}
