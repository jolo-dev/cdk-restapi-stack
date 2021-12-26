import { Phase } from '../../models/Phase';
import { I4DProject, Project } from '../../models/Project';
import { Season } from '../../models/Season';
import { StandardAttribute } from '../../models/StandardAttribute';
import { Tag } from '../../models/Tag';
import DynamoDb from '../src/DynamoDb';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// This should be run against your local DynamoDB
// That is why they are skipped in the global tests
// Make sure to remove the 'skip'
describe('Integration', () => {
  const dynamo = new DynamoDb({ endpoint: 'http://localhost:4566', region: 'eu-west-1' });
  const season = 'Winter';
  const phase = 'Available';
  const tags = ['tag1', 'tag2'];
  test.skip('add Project and deletes a project based on name', async () => {
    // Adding a project
    const props: I4DProject = {
      coverImage: 's3://url',
      description: 'This is a Description',
      name: 'TestProject',
      author: 'TestAuthor',
      phase,
      season,
      tags,
    };
    const project = new Project(props.name, props);
    const entries = await dynamo.addEntry(project);
    expect(entries.$metadata.httpStatusCode).toBe(200);

    // Check if it is in list
    const resultProject = await dynamo.listEntries<Project, I4DProject>('Projects', Project);
    expect(resultProject[0]).toEqual(project);

    // Delete the project
    const foo = await dynamo.deleteEntry('Projects', props.name);
    expect(foo.$metadata.httpStatusCode).toBe(200);
    const checkIfEmpty = await dynamo.listEntries('Projects', Project);
    expect(checkIfEmpty.length).toBe(0);
  });

  test.skip('add Season and delete Season based on Name', async () => {
    const seasonObj = new Season(season);
    const entries = await dynamo.addEntry(seasonObj);
    expect(entries.$metadata.httpStatusCode).toBe(200);

    const result = await dynamo.listEntries<Season, StandardAttribute>('Seasons', Season);
    expect(result[0]).toEqual(seasonObj);

    // Delete the season
    const foo = await dynamo.deleteEntry('Seasons', season);
    expect(foo.$metadata.httpStatusCode).toBe(200);
    const checkIfEmpty = await dynamo.listEntries('Seasons', Season);
    expect(checkIfEmpty.length).toBe(0);
  });

  test.skip('add Phase and delete Phase based on Name', async () => {
    const phaseObj = new Phase(phase);
    const entries = await dynamo.addEntry(phaseObj);
    expect(entries.$metadata.httpStatusCode).toBe(200);

    const result = await dynamo.listEntries<Phase, StandardAttribute>('Phases', Phase);
    expect(result[0]).toEqual(phaseObj);

    // Delete the phase
    const foo = await dynamo.deleteEntry('Phases', phase);
    expect(foo.$metadata.httpStatusCode).toBe(200);
    const checkIfEmpty = await dynamo.listEntries('Phases', Phase);
    expect(checkIfEmpty.length).toBe(0);
  });

  test.skip('add multiple Tags and delete them based on Name', async () => {

    tags.forEach(async(tag) =>{
      const entries = await dynamo.addEntry(new Tag(tag));
      expect(entries.$metadata.httpStatusCode).toBe(200);
    });


    // Check if Tags are saved
    const resultTags = await dynamo.listEntries<Tag, StandardAttribute>('Tags', Tag);
    resultTags.sort((a, b) => a.getName().localeCompare(b.getName())).forEach((tag, idx) => {
      expect(tag).toEqual(new Tag(tags[idx]));
    });

    // Delete the Tags
    tags.forEach(async(tag) =>{
      const foo = await dynamo.deleteEntry('Tags', tag);
      expect(foo.$metadata.httpStatusCode).toBe(200);
    });

    const checkIfEmpty = await dynamo.listEntries('Tags', Tag);
    expect(checkIfEmpty.length).toBe(0);

  });

  test.only('update a project', async () => {
    // Adding a project
    const props: I4DProject = {
      name: 'UpdateMe',
      coverImage: 's3://url',
      description: 'This is a Description',
      author: 'TestAuthor',
      phase,
      season,
      tags,
    };
    const project = new Project(props.name, props);
    await dynamo.addEntry(project);

    const propsToUpdate: I4DProject = {
      name: 'UpdateMe',
      author: 'UpdateAuthor',
      description: 'UpdateDescription',
    };
    const entry = await dynamo.getItem<I4DProject>('Projects', propsToUpdate.name);
    const updatedProps = { ...entry, ...propsToUpdate };
    // Adding an entry with the same partition key works like updating them
    const updateEntry = new Project(entry.name, updatedProps, entry.creationDateTime);
    const entries = await dynamo.addEntry(updateEntry);
    expect(entries.$metadata.httpStatusCode).toBe(200);
    const checkUpdate = await dynamo.getItem<I4DProject>('Projects', propsToUpdate.name);
    expect(checkUpdate).toEqual(updatedProps);

    const foo = await dynamo.deleteEntry('Projects', props.name);
    expect(foo.$metadata.httpStatusCode).toBe(200);
  });
});