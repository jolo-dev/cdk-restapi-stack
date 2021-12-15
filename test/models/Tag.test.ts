import { ITag, Tag } from '../../models/Tag';
Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

// ID will be mocked unless you put your own ID
jest.mock('uuid', () => {
  return {
    v4: jest.fn().mockReturnValue('123456789'),
  };
});
describe('Tag', () => {
  const tagProps: ITag = {
    id: '123456789',
    creationDateTime: '2020-01-01T00:00:00+01:00',
    name: 'Test',
  };
  const tag = new Tag(tagProps);

  it('should return ID when setting it', () => {
    expect(tag.getId()).toBe('123456789');
  });

  it('should return CreationDateTime when setting it', () => {
    expect(tag.getCreationDateTime()).toBe('2020-01-01T00:00:00+01:00');
  });

  it('should return props', () => {
    expect(tag.getProps()).toEqual(tagProps);
  });
});