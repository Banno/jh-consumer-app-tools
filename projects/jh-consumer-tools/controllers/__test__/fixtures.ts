// SPDX-FileCopyrightText: 2025 Jack Henry
//
// SPDX-License-Identifier: Apache-2.0

import type { Institution } from '../../types/institution';

export type LinkSpec = { linkType: string; name?: string; title?: string; id?: string; fdicNotice?: string };

export function makeInstitution(
  abilities: Record<string, unknown> = {},
  links: LinkSpec[] = [],
  extra: Record<string, unknown> = {},
): Institution {
  return {
    id: 'inst-1',
    abilities: { conversations: true, ...abilities },
    smallBusinessSettings: {},
    isCashManagement: false,
    links: links.map((link, index) => ({
      id: link.id ?? `link-${index}-${link.linkType}`,
      name: link.name ?? link.linkType.toLowerCase(),
      title: link.title ?? `${link.linkType} title`,
      description: '',
      fdicNotice: link.fdicNotice ?? '',
      linkType: link.linkType,
    })),
    ...extra,
  } as unknown as Institution;
}

export const ids = (links: Array<{ id: string; links?: Array<{ id: string }> }>) =>
  links.map((link) => (link.links ? `${link.id}[${link.links.map((child) => child.id).join(',')}]` : link.id));
