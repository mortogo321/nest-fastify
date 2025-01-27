import { format } from 'date-fns';

const response = {
  status: { type: 'boolean', example: true },
  statusCode: { type: 'number', example: 200 },
  path: { type: 'string' },
  timestamp: {
    type: 'string',
    example: format(new Date().toISOString(), 'yyyy-MM-dd HH:mm:ss OOOO'),
  },
  message: { type: 'string', example: 'success' },
  data: { type: 'object' },
};

export const HttpResponseSchema = {
  status: 200,
  schema: { properties: response },
};

export const HttpResponsePaginationSchema = {
  status: 200,
  schema: {
    properties: {
      ...response,
      total: { type: 'number', example: 1 },
    },
  },
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const { data, ...badResponse } = response;

export const HttpBadRequestSchema = {
  status: 400,
  schema: {
    properties: {
      ...badResponse,
      status: { type: 'boolean', example: false },
      statusCode: { type: 'number', example: 400 },
      message: { type: 'string', example: 'Bad Request' },
      errors: { type: 'object' },
    },
  },
};
