import { Season } from '../../models/Season';
import { StandardAttribute } from '../../models/StandardAttribute';
Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

describe('Season', () => {
  const seasonProps: StandardAttribute = {
    creationDateTime: '2020-01-01T00:00:00+01:00',
    name: 'Test',
  };
  const season = new Season(seasonProps.name);

  it('should return ID when setting it', () => {
    expect(season.getName()).toBe('Test');
  });

  it('should return CreationDateTime when setting it', () => {
    expect(season.getCreationDateTime()).toBe('2020-01-01T00:00:00+01:00');
  });

  it('should return props when set', () => {
    const props: any = {
      foo: 'bar',
    };
    const seasonWithProps = new Season(seasonProps.name, props);
    expect(seasonWithProps.getProps()).toEqual(props);
  });
});