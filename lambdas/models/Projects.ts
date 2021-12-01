import moment from 'moment';
import { v4 as uuid } from 'uuid';

const projects = {
  model: {
    entity: 'projects',
    version: '1',
    service: 'asset-management',
  },
  attributes: {
    id: {
      type: 'string',
      default: () => uuid(),
    },
    projectName: {
      type: 'string',
      required: true,
    },
    author: {
      type: 'string',
      required: true,
    },
    creationDateTime: {
      type: 'string',
      validate: (date: string) => {
        if (!moment(date).isValid) {
          throw new Error('Invalid date format');
        }
      },
      required: true,
    },
    coverImage: {
      type: 'string',
    },
    season: {
      type: ['development', 'marketing', 'finance', 'product', 'cool cats and kittens'] as const,
    },
    state: {
      type: 'string',
    },
  },
  indexes: {
    id: {
      pk: {
        field: 'pk',
        composite: ['employee'],
      },
    },
  },
} as const;

export default projects;