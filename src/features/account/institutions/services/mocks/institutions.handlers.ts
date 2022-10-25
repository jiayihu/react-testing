import { faker } from '@faker-js/faker';
import { range } from 'lodash';
import { rest } from 'msw';
import { PostRequisitionResponse } from '../institutions.nordigen';
import { createInstitution, createRequisition } from './institutionts.fixtures';

export const institutionHandlers = [
  rest.get('/nordigen/api/v2/institutions/', (req, res, ctx) => {
    const country = req.url.searchParams.get('country') ?? 'IT';
    const institutions = range(0, 5).map(() =>
      createInstitution({
        countries: [country],
      }),
    );

    return res(ctx.status(200), ctx.json(institutions));
  }),
  rest.get('/nordigen/api/v2/institutions/:id/', (req, res, ctx) => {
    const { id } = req.params;
    const institution = createInstitution(id ? { id: String(id) } : {});

    return res(ctx.status(200), ctx.json(institution));
  }),
  rest.get('/nordigen/api/v2/requisitions/:id/', (req, res, ctx) => {
    const { id } = req.params;
    const requisition = createRequisition(id ? { id: String(id) } : {});

    return res(ctx.status(200), ctx.json(requisition));
  }),
  rest.post('/nordigen/api/v2/requisitions/', (req, res, ctx) => {
    const requisition = createRequisition();
    const response: PostRequisitionResponse = {
      ...requisition,
      redirect: faker.internet.url(),
      user_language: faker.address.countryCode(),
      link: '/requisition',
    };

    return res(ctx.status(200), ctx.json(response));
  }),
];
