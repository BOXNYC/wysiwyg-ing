import { FC } from 'react';

export interface WysiwygEditorProps {
  /** Initial markdown content for the editor */
  defaultValue?: string;
  /** Show demo content when no defaultValue is provided */
  demo?: boolean;
}

declare const WysiwygEditor: FC<WysiwygEditorProps>;

export default WysiwygEditor;
