import { I4DProject, Project } from '../../models/Project';

Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// ID will be mocked unless you put your own ID
jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('123456789'),
  };
});
describe('Project', () => {
  const props: I4DProject = {
    author: 'Test',
    coverImage: 'TestCover',
    description: 'Test Description',
    projectName: 'Test ProjectName',
  };
  const project = new Project(props);
  it('should return props', () => {
    expect(project.getProps()).toEqual(props);
  });

  it('should return CreationDateTime', () => {
    expect(project.getCreationDateTime()).toBe('2020-01-01T00:00:00+01:00');
  });

  it('should return ID', () => {
    expect(project.getId()).toBe('123456789');
  });
});