import { QUEUE_IDS } from '../types/queue-id.type';

const queueIdToName: QUEUE_IDS = {
  '420': 'RANKED_SOLO_5x5',
  '440': 'RANKED_FLEX_SR',
  '430': 'NORMAL_BLIND_PICK',
  '400': 'NORMAL_DRAFT_PICK',
  '450': 'ARAM',
  '0': 'ALL',
} as const;

export const getQueueName = (queueId: keyof typeof queueIdToName): string => {
  return queueIdToName[queueId];
};
