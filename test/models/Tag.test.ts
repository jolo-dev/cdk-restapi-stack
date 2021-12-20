import { StandardAttribute } from '../../models/StandardAttribute';
import { Tag } from '../../models/Tag';
Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

describe('Tag', () => {
  const tagProps: StandardAttribute = {
    creationDateTime: '2020-01-01T00:00:00+01:00',
    name: 'Test',
  };
  const tag = new Tag(tagProps.name);

  it('should return ID when setting it', () => {
    expect(tag.getName()).toBe('Test');
  });

  it('should return CreationDateTime when setting it', () => {
    expect(tag.getCreationDateTime()).toBe('2020-01-01T00:00:00+01:00');
  });
});