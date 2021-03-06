import { extendConfig } from '@axew/jugg';
import { IgnorePlugin } from 'webpack';
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const WriteFilePlugin = require('write-file-webpack-plugin');
const pkg = require('./package.json');

const IS_PROD = process.env.NODE_ENV === 'production';

export default extendConfig({
  sourceMap: false,
  publicPath: IS_PROD ? './' : '/',
  tsCustomTransformers: {
    before: [
      [
        'ts-import-plugin',
        {
          libraryDirectory: 'lib',
          libraryName: 'antd',
          style: true,
        },
      ],
      '@axew/jugg-plugin-react/lib/ts-rhl-transformer',
    ],
  },
  webpack: ({ config }) => {
    config.entryPoints.clear().end();

    config
      .entry('content')
      .add(`./src/content`)
      .end();

    ['background', 'options', 'popup'].forEach(name => {
      config
        .entry(name)
        .add(`./src/${name}`)
        .end()
        .plugin(`html-${name}`)
        .use(HtmlWebpackPlugin, [
          {
            template: `./src/documents/${name}.ejs`,
            filename: `${name}.html`,
            chunks: [name],
            inject: true,
          },
        ]);
    });

    config
      .plugin('copy')
      .use(CopyPlugin, [
        [
          { from: 'public' },
          {
            from: 'public/manifest.json',
            transform(content) {
              // generates the manifest file using the package.json informations
              return Buffer.from(
                JSON.stringify({
                  description: pkg.description,
                  version: pkg.version,
                  name: pkg.displayName,
                  ...JSON.parse(content.toString()),
                }),
              );
            },
          },
        ],
      ])
      .end()
      .plugin('write-file')
      .use(WriteFilePlugin)
      .end()
      // ref: https://github.com/jmblog/how-to-optimize-momentjs-with-webpack#/
      // en, zh-cn
      .plugin('ignore-moment-locale')
      .use(IgnorePlugin, [/^\.\/locale$/, /moment$/])
      .end();

    if (!IS_PROD) {
      config.resolve.alias.merge({
        'react-dom': '@hot-loader/react-dom',
      });
    }

    config.resolve.alias.merge({
      '@ant-design/icons/lib/dist$': '@/antdIcon',
    });

    return {
      devServer: {
        port: 4000,
      },
    };
  },
  html: false,
  filename: '[name]',
  css: {
    loaderOptions: {
      css: {},
      less: {
        modifyVars: {
          'primary-color': '#66ccff',
          'link-color': '#66ccff',
          'border-radius-base': '2px',
        },
      },
      postcss: {},
    },
  },
  define: {
    DEFINE: {
      name: pkg.name,
      displayName: pkg.displayName,
      version: pkg.version,
      FAKE_POPUP_URL: IS_PROD ? '' : process.env.FAKE_POPUP_URL,
    },
  },
  chunks: false,
});
