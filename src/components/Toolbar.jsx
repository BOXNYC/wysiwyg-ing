import React from 'react';
import { ToolbarButton, ToolbarDivider } from './ToolbarButton';
import {
  BoldIcon, ItalicIcon, UnderlineIcon, StrikethroughIcon,
  LinkIcon, CodeIcon, QuoteIcon, ListBulletIcon, ListNumberIcon,
  H1Icon, H2Icon, H3Icon, HRIcon, DownloadIcon, AlignCenterIcon, SpellcheckIcon, ImageIcon
} from '../icons';

export function Toolbar({
  colors,
  activeFormats,
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onCode,
  onLink,
  onQuote,
  onBulletList,
  onNumberList,
  onH1,
  onH2,
  onH3,
  onHR,
  onCenter,
  onSpellCheck,
  spellCheck,
  onImage,
  onExport
}) {
  return (
    <div style={{ display: 'flex', gap: 2, flexWrap: 'wrap', alignItems: 'center' }}>
      <ToolbarButton icon={<H1Icon />} label="H1" onClick={onH1} colors={colors} />
      <ToolbarButton icon={<H2Icon />} label="H2" onClick={onH2} colors={colors} />
      <ToolbarButton icon={<H3Icon />} label="H3" onClick={onH3} colors={colors} />
      <ToolbarDivider colors={colors} />
      
      <ToolbarButton icon={<BoldIcon />} label="Bold" onClick={onBold} active={activeFormats.bold} colors={colors} />
      <ToolbarButton icon={<ItalicIcon />} label="Italic" onClick={onItalic} active={activeFormats.italic} colors={colors} />
      <ToolbarButton icon={<UnderlineIcon />} label="Underline" onClick={onUnderline} active={activeFormats.underline} colors={colors} />
      <ToolbarButton icon={<StrikethroughIcon />} label="Strike" onClick={onStrikethrough} active={activeFormats.strikethrough} colors={colors} />
      <ToolbarDivider colors={colors} />
      
      <ToolbarButton icon={<LinkIcon />} label="Link" onClick={onLink} active={activeFormats.link} colors={colors} />
      <ToolbarButton icon={<ImageIcon />} label="Image" onClick={onImage} active={activeFormats.image} colors={colors} />
      <ToolbarButton icon={<CodeIcon />} label="Code" onClick={onCode} active={activeFormats.code} colors={colors} />
      <ToolbarButton icon={<QuoteIcon />} label="Quote" onClick={onQuote} colors={colors} />
      <ToolbarDivider colors={colors} />
      
      <ToolbarButton icon={<ListBulletIcon />} label="Bullets" onClick={onBulletList} colors={colors} />
      <ToolbarButton icon={<ListNumberIcon />} label="Numbers" onClick={onNumberList} colors={colors} />
      <ToolbarButton icon={<HRIcon />} label="HR" onClick={onHR} colors={colors} />
      <ToolbarButton icon={<AlignCenterIcon />} label="Center" onClick={onCenter} active={activeFormats.center} colors={colors} />
      <ToolbarButton icon={<SpellcheckIcon />} label="Spellcheck" onClick={onSpellCheck} active={spellCheck} colors={colors} />
      <ToolbarDivider colors={colors} />

      <ToolbarButton icon={<DownloadIcon />} label="Export" onClick={onExport} colors={colors} />
    </div>
  );
}
