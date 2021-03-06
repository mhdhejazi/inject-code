import { useMobile } from '@/common/hooks';
import {
  boolean2status,
  status2boolean,
  ToggleStatus,
} from '@/components/ToggleStatus';
import {
  EXTENSION_GLOBAL_OPTIONS_KEY,
  ExtensionGlobalOptions,
} from '@/interfaces/entities';
import { AnyFunc } from '@/interfaces/utils';
import { Button, Col, Divider, Form, Radio, Row, Select, Upload } from 'antd';
import { FormItemProps } from 'antd/lib/form';
import * as React from 'react';
import { useMappedState } from 'redux-react-hook';
import { store, useStore } from '../store';
import { DATA_IMPORT_EXIST_BEHAVIOR_OPTIONS } from '../store/options';
import { model } from './model';
import * as styles from './style.module.less';

// @ts-ignore
store.model(model);

const Panel: React.SFC<{
  title?: React.ReactNode;
  content?: React.ReactNode;
  line?: boolean;
}> = ({ title, content, line = true }) => (
  <>
    <Row gutter={8}>
      <Col md={4} sm={24} className={styles.title}>
        {title}
      </Col>
      <Col md={20} sm={24}>
        {content}
      </Col>
    </Row>
    {line && (
      <Divider
        style={{
          width: '90%',
          minWidth: '90%',
          marginLeft: 'auto',
          marginRight: 'auto',
        }}
      />
    )}
  </>
);

export const Setting: React.SFC<{}> = props => {
  const isMobile = useMobile();
  const { globalOptions, exportLoading, importLoading } = useMappedState(
    React.useCallback<
      AnyFunc<{
        globalOptions: ExtensionGlobalOptions;
        exportLoading: boolean;
        importLoading: boolean;
      }>
    >(
      _ => ({
        globalOptions: _.all.globalOptions,
        exportLoading: _.loading.effects.setting.exportData,
        importLoading: _.loading.effects.setting.importData,
      }),
      [],
    ),
  );
  const {
    [EXTENSION_GLOBAL_OPTIONS_KEY.status]: status,
    [EXTENSION_GLOBAL_OPTIONS_KEY.useCodeEditor]: useCodeEditor,
    [EXTENSION_GLOBAL_OPTIONS_KEY.codemirrorTheme]: codemirrorTheme,
    [EXTENSION_GLOBAL_OPTIONS_KEY.codemirrorLineNumbers]: codemirrorLineNumbers,
    [EXTENSION_GLOBAL_OPTIONS_KEY.dataImportExistBehavior]: dataImportExistBehavior,
  } = globalOptions;
  const { dispatch } = useStore();

  React.useEffect(() => {
    dispatch.all.getGlobalOptions();
  }, []);

  const colLayout1_2 = {
    md: 12,
    sm: 24,
    xs: 24,
  };

  const colLayout1_3 = {
    md: 8,
    sm: 24,
    xs: 24,
  };

  const formItemLayout: FormItemProps = {
    labelCol: {
      md: 8,
    },
    labelAlign: 'left',
  };

  return (
    <Form
      className={`${styles.wrap} ${isMobile && styles['wrap-m']}`}
      layout={isMobile ? 'vertical' : 'inline'}
    >
      <Panel
        title="Normal"
        content={
          <>
            <Row gutter={16}>
              <Col {...colLayout1_2}>
                <Form.Item {...formItemLayout} label="Extension Status">
                  <ToggleStatus
                    value={status}
                    onChange={_ =>
                      dispatch.all.updateGlobalOptions({
                        [EXTENSION_GLOBAL_OPTIONS_KEY.status]: _,
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
            <Row gutter={16}>
              <Col {...colLayout1_2}>
                <Form.Item
                  {...formItemLayout}
                  label="Enable code editor"
                  help={
                    <>
                      Use code editor to display code. <br />
                      Considering performance, it is turned off by default.
                    </>
                  }
                >
                  <ToggleStatus
                    value={boolean2status(useCodeEditor)}
                    onChange={_ =>
                      dispatch.all.updateGlobalOptions({
                        [EXTENSION_GLOBAL_OPTIONS_KEY.useCodeEditor]: status2boolean(
                          _,
                        ),
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        }
      />
      <Panel
        title="Code Editor"
        line
        content={
          <>
            <Row gutter={16}>
              <Col {...colLayout1_2}>
                <Form.Item {...formItemLayout} label="Theme">
                  <Select
                    className={styles['editor-theme-select']}
                    value={codemirrorTheme}
                    onChange={_ =>
                      dispatch.all.updateGlobalOptions({
                        [EXTENSION_GLOBAL_OPTIONS_KEY.codemirrorTheme]: _,
                      })
                    }
                    disabled={!useCodeEditor}
                  >
                    {[
                      ['material', '#263238'],
                      ['base16-light', '#f5f5f5'],
                      ['twilight', '#141414'],
                    ].map(([t, color]) => (
                      <Select.Option key={t} value={t}>
                        <span
                          className={styles['color-panel']}
                          style={{
                            backgroundColor: color,
                          }}
                        />
                        {t}
                      </Select.Option>
                    ))}
                  </Select>
                </Form.Item>
              </Col>
              <Col {...colLayout1_2}>
                <Form.Item {...formItemLayout} label="Line numbers">
                  <ToggleStatus
                    disabled={!useCodeEditor}
                    value={boolean2status(codemirrorLineNumbers)}
                    onChange={_ =>
                      dispatch.all.updateGlobalOptions({
                        [EXTENSION_GLOBAL_OPTIONS_KEY.codemirrorLineNumbers]: status2boolean(
                          _,
                        ),
                      })
                    }
                  />
                </Form.Item>
              </Col>
            </Row>
          </>
        }
      />
      <Panel
        title="Data"
        line={false}
        content={
          <>
            <Row gutter={16}>
              <Col {...colLayout1_3}>
                <Form.Item {...formItemLayout}>
                  <Button
                    style={{ marginRight: 10 }}
                    loading={exportLoading}
                    onClick={() => {
                      dispatch.setting.exportData();
                    }}
                    icon="export"
                  >
                    Export
                  </Button>
                </Form.Item>
              </Col>
              <Col {...colLayout1_3}>
                <Form.Item {...formItemLayout}>
                  <Upload
                    accept="application/json"
                    beforeUpload={() => false}
                    showUploadList={false}
                    onChange={e => {
                      dispatch.setting.importData({
                        file: e.file,
                        behavior: dataImportExistBehavior,
                      });
                    }}
                  >
                    <Button loading={importLoading} icon="import">
                      Import
                    </Button>
                  </Upload>
                </Form.Item>
                <Form.Item {...formItemLayout} label="When exists">
                  <Radio.Group
                    value={dataImportExistBehavior}
                    onChange={e =>
                      dispatch.all.updateGlobalOptions({
                        [EXTENSION_GLOBAL_OPTIONS_KEY.dataImportExistBehavior]:
                          e.target.value,
                      })
                    }
                  >
                    {DATA_IMPORT_EXIST_BEHAVIOR_OPTIONS().map(
                      ([value, label]) => (
                        <Radio value={value} key={value}>
                          {label}
                        </Radio>
                      ),
                    )}
                  </Radio.Group>
                </Form.Item>
              </Col>
            </Row>
          </>
        }
      />
    </Form>
  );
};
