import type { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

import { appV2Tone } from '../styles/tokens';

export function QuoteFact({
  icon,
  label,
  value,
}: {
  icon: IconDefinition;
  label: string;
  value: string;
}) {
  return (
    <div className="tw-flex tw-items-start tw-gap-2">
      <dt className="tw-min-w-[112px] tw-font-semibold tw-uppercase tw-text-[#52677F]">
        <FontAwesomeIcon icon={icon} className="tw-mr-1.5 tw-w-4 tw-text-[#8BA0BC]" />
        {label}:
      </dt>
      <dd className={`tw-m-0 tw-font-medium ${appV2Tone.mutedText}`}>{value}</dd>
    </div>
  );
}
