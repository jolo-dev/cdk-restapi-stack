import { getCurrentInvoke } from '@vendia/serverless-express';
import compression from 'compression';
import cors from 'cors';
import express, { Request, Response } from 'express';

const app = express();
const router = express.Router();

router.use(compression());
router.use(cors());
router.use(express.json());
router.use(express.urlencoded({ extended: true }));

app.use(express.static(__dirname + '/openapi'));

router.get('/', (req: Request, res: Response) => {
  const currentInvoke = getCurrentInvoke();
  const { event = {} } = currentInvoke;
  const { requestContext = {} } = event;
  const { domainName = 'localhost:3000' } = requestContext;
  const apiUrl = `https://${domainName}`;
  return res.render('index', {
    apiUrl,
  });
});

// The serverless-express library creates a server and listens on a Unix
// Domain Socket for you, so you can remove the usual call to app.listen.
// app.listen(3000)
app.use('/', router);

export { app };
