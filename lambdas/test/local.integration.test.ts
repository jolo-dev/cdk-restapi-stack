import { Phase } from '../../models/Phase';
import { I4DProject, Project } from '../../models/Project';
import { Season } from '../../models/Season';
import { StandardAttribute } from '../../models/StandardAttribute';
import { Tag } from '../../models/Tag';
import DynamoDb from '../src/DynamoDb';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// This should be run against your local DynamoDB
// That is why they are skipped in the global tests
describe('POST', () => {
  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  test.skip('add Project', async () => {
    const props: I4DProject = {
      coverImage: 's3://url',
      description: 'This is a Description',
      name: 'TestProject',
      phase: 'Available',
      author: 'TestAuthor',
      season: 'Winter',
      tags: ['tag1'],
    };
    const project = new Project(props.name, props);
    const entries = await dynamo.addEntry(project);
    expect(entries.$metadata.httpStatusCode).toBe(200);

    const result = await dynamo.listEntries<Project, I4DProject>('Projects', Project);
    expect(result[0]).toEqual(project);
  });

  test.skip('add Season', async () => {
    const season = new Season('Season');
    const entries = await dynamo.addEntry(season);
    expect(entries.$metadata.httpStatusCode).toBe(200);

    const result = await dynamo.listEntries<Season, StandardAttribute>('Seasons', Season);
    expect(result[0]).toEqual(season);
  });

  test.skip('deletes a project', async () => {
    const foo = await dynamo.deleteEntry('Projects', 'TestProject');
    expect(foo.$metadata.httpStatusCode).toBe(200);
    const entries = await dynamo.listEntries('Projects', Project);
    expect(entries.length).toBe(0);
  });

  test.skip('get all Projects', async () => {
    const entries = await dynamo.listEntries('Projects', Project);
    console.log(entries);
  });

  test.skip('get all Seasons', async () => {
    const entries = await dynamo.listEntries('Seasons', Season);
    console.log(entries);
  });

  test.skip('add a new Project with storing Season, Phase, and multiple Tags', async () => {
    const props: I4DProject = {
      author: 'TestAuthor5',
      coverImage: 's3://',
      description: 'Foobar',
      name: 'ProjectName2',
      tags: ['tags2', 'name2'],
    };
    const project = new Project(props.name, props);
    if (props.season) {
      const entry = await dynamo.addEntry(new Season(props.season));
      const statusCode = entry.$metadata.httpStatusCode ?? 400;
      expect(statusCode).toBe(200);
    }
    if (props.phase) {
      const entry = await dynamo.addEntry(new Phase(props.phase));
      const statusCode = entry.$metadata.httpStatusCode ?? 400;
      expect(statusCode).toBe(200);
    }
    if (props.tags) {
      for (const tag of props.tags) {
        const entry = await dynamo.addEntry(new Tag(tag));
        const statusCode = entry.$metadata.httpStatusCode ?? 400;
        expect(statusCode).toBe(200);
      }
    }
    const entry = await dynamo.addEntry(project);
    const statusCode = entry.$metadata.httpStatusCode ?? 400;
    expect(statusCode).toBe(200);
  });

  test('get all Tags', async () => {
    const entries = await dynamo.listEntries('Tags', Tag);
    console.log(entries);
  });
});