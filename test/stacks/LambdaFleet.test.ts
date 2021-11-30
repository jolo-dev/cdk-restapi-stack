describe('LambdaFleet', () => {

  // const app = new App({
  //   context: {
  //     vpcId: 'vpc-123456789',
  //     privateSubnet1: 'private-subnet-1',
  //     privateSubnet2: 'private-subnet-2',
  //   },
  // });

  // beforeAll(() => {
  //   if (fs.existsSync(`test/${ps.getLambdaFolder()}/dist`)) {
  //     fs.rmSync(`test/${ps.getLambdaFolder()}/dist`, { recursive: true });
  //   }
  // });

  it.todo('should bundle the code');
  // await lambdaFleetStack.bundlingLambdas();
  // // Need to put a timeout otherwise race condition.
  // setTimeout(() => {
  //   expect(lambdaFleetStack.getAllLambdasFromFolder(`${ps.getLambdaFolder()}/dist`))
  //     .toEqual(['assets.js']);
  // }, 3000);

  it.todo('should return the folder of the built Lambdas');
  // expect(lambdaFleetStack.getAllLambdasFromFolder(`${ps.getLambdaFolder()}/src`))
  //   .toEqual(['assets.ts']);


  it.todo('should throw when trying to bundle the folder');
  // const spy = jest.spyOn(lambdaFleetStack, 'getAllLambdasFromFolder').mockReturnValue([]);
  // await expect(lambdaFleetStack.bundlingLambdas()).rejects.toThrowError();
  // spy.mockRestore();

  it.todo('should throw when folder not exists');
  // expect(() => lambdaFleetStack.getAllLambdasFromFolder('foo'))
  //   .toThrowError('Cannot find folder: foo');
});