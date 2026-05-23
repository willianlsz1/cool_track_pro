import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faLayerGroup } from '@fortawesome/free-solid-svg-icons';

import { appV2Tone } from '../styles/tokens';
import { SectionCard } from '../ui/primitives';
import { defaultTemplateId, quoteTemplates, type QuoteTemplate } from './quoteTemplates';

export function QuoteTemplatePanel({
  activeTemplateId = defaultTemplateId,
  onApplyTemplate,
}: {
  activeTemplateId?: string;
  onApplyTemplate?: (template: QuoteTemplate) => void;
}) {
  return (
    <SectionCard padding="md">
      <div className="tw-flex tw-items-center tw-gap-2">
        <FontAwesomeIcon icon={faLayerGroup} className="tw-text-[#2563EB]" aria-hidden="true" />
        <h2 className={`tw-m-0 tw-text-base tw-font-bold ${appV2Tone.text}`}>
          Modelos de orçamento
        </h2>
      </div>
      <p className={`tw-m-0 tw-mt-2 tw-text-xs ${appV2Tone.mutedText}`}>
        O modelo preenche o rascunho inicial. O técnico pode editar título, itens, valores e
        condições.
      </p>

      <div className="tw-mt-4 tw-grid tw-gap-2">
        {quoteTemplates.map((template) => {
          const isActive = template.id === activeTemplateId;

          return (
            <button
              type="button"
              key={template.id}
              onClick={() => onApplyTemplate?.(template)}
              className={`tw-w-full tw-rounded-xl tw-border tw-p-3 tw-text-left ${
                isActive ? 'tw-border-[#2563EB] tw-bg-[#EFF6FF]' : 'tw-border-[#E2E8F0] tw-bg-white'
              } ${onApplyTemplate ? appV2Tone.focus : ''}`}
            >
              <div className="tw-flex tw-gap-3">
                <div
                  className={`tw-flex tw-h-10 tw-w-10 tw-shrink-0 tw-items-center tw-justify-center tw-rounded-xl ${
                    isActive ? 'tw-bg-white tw-text-[#2563EB]' : 'tw-bg-[#F8FAFE] tw-text-[#1E4F8A]'
                  }`}
                >
                  <FontAwesomeIcon icon={template.icon} aria-hidden="true" />
                </div>
                <div className="tw-min-w-0 tw-flex-1">
                  <h3 className={`tw-m-0 tw-text-sm tw-font-bold ${appV2Tone.text}`}>
                    {template.title}
                  </h3>
                  <p className={`tw-m-0 tw-mt-1 tw-text-xs ${appV2Tone.mutedText}`}>
                    {template.description}
                  </p>
                </div>
                {isActive ? (
                  <span className="tw-h-fit tw-rounded-full tw-bg-[#F0FDF4] tw-px-2 tw-py-0.5 tw-text-xs tw-font-bold tw-text-[#16A34A]">
                    Aplicado
                  </span>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </SectionCard>
  );
}
