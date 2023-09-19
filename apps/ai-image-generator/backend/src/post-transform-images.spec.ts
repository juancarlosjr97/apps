import * as nodeFetch from 'node-fetch';

import { expect } from 'chai';
import { mockLandscapeAiImages, mockPortraitAiImages } from '../test/mocks';
import { findColorProportion, readableStreamFromFile, writeFiles } from '../test/utils';
import { PostTransformImages } from './post-transform-images';
import { toDimensions } from './utils';
import sharp from 'sharp';
import sinon from 'sinon';
import { BAR_COLOR } from './transform-images';

describe('PostTransformImages', () => {
  let fetchStub: sinon.SinonStub;

  beforeEach(async () => {
    fetchStub = sinon.stub(nodeFetch, 'default');
    fetchStub.callsFake(async (url: string): Promise<nodeFetch.Response> => {
      const fileContents = await readableStreamFromFile(url);
      return new Promise((resolve) =>
        resolve(new nodeFetch.Response(fileContents, { status: 200 }))
      );
    });
  });

  afterEach(async () => {
    fetchStub.restore();
  });

  describe('#execute', () => {
    let postTransformImages: PostTransformImages;

    describe('when image result is landscape', () => {
      beforeEach(async () => {
        const images = mockLandscapeAiImages;
        const dimensions = toDimensions(1487, 1066);
        postTransformImages = new PostTransformImages(images, dimensions);
      });

      it('returns transformed streams', async () => {
        const result = await postTransformImages.execute();
        const imageSharp = sharp(await result[0].stream.toBuffer());

        await writeFiles({ imageSharp }, 'result-landscape');

        const imageMetadata = await imageSharp.metadata();

        expect(imageMetadata).to.have.property('width', 1024);
        expect(imageMetadata).to.have.property('height', 734);
        expect(imageMetadata).to.have.property('format', 'png');
      });
    });

    describe('when image is small landscape', () => {
      beforeEach(async () => {
        const images = mockLandscapeAiImages;
        const dimensions = toDimensions(900, 645);
        postTransformImages = new PostTransformImages(images, dimensions);
      });

      it('returns transformed streams', async () => {
        const result = await postTransformImages.execute();
        const imageSharp = sharp(await result[0].stream.toBuffer());

        await writeFiles({ imageSharp }, 'result-landscape-small');

        const imageMetadata = await imageSharp.metadata();

        expect(imageMetadata).to.have.property('width', 900);
        expect(imageMetadata).to.have.property('height', 645);
        expect(imageMetadata).to.have.property('format', 'png');
      });
    });

    describe('when image is extra pixel landscape', () => {
      beforeEach(async () => {
        const images = [
          {
            url: './test/mocks/images/landscape-extra-pixel-dalle-result.png',
            imageType: 'png',
          },
        ];
        const dimensions = toDimensions(700, 467);
        postTransformImages = new PostTransformImages(images, dimensions);
      });

      it('returns transformed streams', async () => {
        const result = await postTransformImages.execute();
        const imageSharp = sharp(await result[0].stream.toBuffer());
        const bottomEdge = imageSharp.clone().extract({ left: 0, top: 466, width: 700, height: 1 });

        await writeFiles({ imageSharp, bottomEdge }, 'result-landscape-small-extra-pixel');

        const imageMetadata = await imageSharp.metadata();

        expect(imageMetadata).to.have.property('width', 700);
        expect(imageMetadata).to.have.property('height', 467);
        expect(imageMetadata).to.have.property('format', 'png');

        const bottomEdgeBarColorProportion = await findColorProportion(bottomEdge, BAR_COLOR, {
          tolerance: 30,
        });
        expect(bottomEdgeBarColorProportion).to.lessThan(1);
      });
    });

    describe('when generated image is smaller than desired dimensions (increase)', () => {
      beforeEach(async () => {
        const images = [
          {
            url: './test/mocks/images/landscape-extra-pixel-dalle-result-512.png',
            imageType: 'png',
          },
        ];
        const dimensions = toDimensions(700, 467);
        postTransformImages = new PostTransformImages(images, dimensions);
      });

      it('returns transformed streams', async () => {
        const result = await postTransformImages.execute();
        const imageSharp = sharp(await result[0].stream.toBuffer());
        const bottomEdge = imageSharp.clone().extract({ left: 0, top: 466, width: 700, height: 1 });

        await writeFiles(
          { imageSharp, bottomEdge },
          'result-landscape-generated-small-extra-pixel'
        );

        const imageMetadata = await imageSharp.metadata();

        expect(imageMetadata).to.have.property('width', 700);
        expect(imageMetadata).to.have.property('height', 467);
        expect(imageMetadata).to.have.property('format', 'png');

        const bottomEdgeBarColorProportion = await findColorProportion(bottomEdge, BAR_COLOR, {
          tolerance: 30,
        });
        expect(bottomEdgeBarColorProportion).to.lessThan(1);
      });
    });

    describe('when image result is portrait', () => {
      beforeEach(async () => {
        const images = mockPortraitAiImages;
        const dimensions = toDimensions(1500, 2000);
        postTransformImages = new PostTransformImages(images, dimensions);
      });

      it('returns transformed streams', async () => {
        const result = await postTransformImages.execute();
        const imageSharp = sharp(await result[0].stream.toBuffer());

        await writeFiles({ imageSharp }, 'result-portrait');

        const imageMetadata = await imageSharp.metadata();

        expect(imageMetadata).to.have.property('width', 768);
        expect(imageMetadata).to.have.property('height', 1024);
        expect(imageMetadata).to.have.property('format', 'png');
      });
    });
  });
});