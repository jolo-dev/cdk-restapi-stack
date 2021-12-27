import { Phase } from '../../models/Phase';
import { StandardAttribute } from '../../models/StandardAttribute';
Date.now = jest.fn().mockReturnValue(new Date('2020-01-01T00:00:00.000'));

describe('Phase', () => {
  const phaseProps: StandardAttribute = {
    creationDateTime: '2020-01-01T00:00:00+01:00',
    name: 'Test',
  };
  const phase = new Phase(phaseProps.name);

  it('should return ID when setting it', () => {
    expect(phase.getName()).toBe('Test');
  });

  it('should return CreationDateTime when setting it', () => {
    expect(phase.getCreationDateTime()).toBe('2020-01-01T00:00:00+01:00');
  });

  it('should return props when set', () => {
    const props: any = {
      foo: 'bar',
    };
    const phaseWithProps = new Phase(phaseProps.name, props);
    expect(phaseWithProps.getProps()).toEqual(props);
  });
});