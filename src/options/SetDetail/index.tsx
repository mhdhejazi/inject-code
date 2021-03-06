import { renderOptions } from '@/common/comptsHelper';
import { NEW_THING_ID_PREFIX_MARK, removeIndex } from '@/common/utils';
import { getHashQuery } from '@/components/hashHistory';
import { ToggleStatusButton } from '@/components/ToggleStatus';
import {
  ExtensionGlobalOptions,
  FileSetDetail,
  MATCH_TYPE,
  Rule,
  STATUS,
} from '@/interfaces/entities';
import { AnyFunc } from '@/interfaces/utils';
import {
  Button,
  Col,
  Empty,
  Form,
  Icon,
  Input,
  List,
  Row,
  Select,
  Skeleton,
  Spin,
  Tooltip,
} from 'antd';
import * as React from 'react';
import { useMappedState } from 'redux-react-hook';
import { useStore } from '../store';
import { MATCH_TYPE_OPTIONS } from '../store/options';
import { CodeList } from './CodeList';
import { TopActions } from './TopActions';

const { useEffect, useCallback } = React;

export const mapState = () =>
  useCallback<
    AnyFunc<{
      saveLoading: boolean;
      detailLoading: boolean;
      detail: FileSetDetail | undefined;
      detailCopy: FileSetDetail | undefined;
      globalOptions: ExtensionGlobalOptions;
    }>
  >(
    _ => ({
      saveLoading: _.loading.effects.options.saveFileSet,
      detailLoading: _.loading.effects.options.getFileSetDetail,
      detail: _.options.detail,
      detailCopy: _.options.detailCopy,
      globalOptions: _.all.globalOptions,
    }),
    [],
  );

export const SetDetail: React.SFC = props => {
  const { dispatch } = useStore();
  const { saveLoading, detailLoading, detail, detailCopy } = useMappedState(
    mapState(),
  );
  const setDetail = (_: Partial<FileSetDetail> = {}) =>
    dispatch.options.setState({
      detail: {
        ...detail,
        ..._,
      },
    });
  const fileSetId = +getHashQuery('id');

  const { name, ruleList, id } =
    detail ||
    // tslint:disable-next-line: no-object-literal-type-assertion
    ({
      name: '',
      ruleList: [],
      sourceFileList: [],
      id: 0,
      status: STATUS.ENABLE,
    } as FileSetDetail);

  useEffect(() => {
    const windowBeforeunloadHandler = e => {
      if (JSON.stringify(detail) !== JSON.stringify(detailCopy)) {
        e.returnValue = true;
      }
    };
    window.addEventListener('beforeunload', windowBeforeunloadHandler);

    return () => {
      window.removeEventListener('beforeunload', windowBeforeunloadHandler);
    };
  }, [detail, detailCopy]);

  useEffect(() => {
    dispatch.options.getFileSetDetail({ id: fileSetId });

    return () => {
      dispatch.options.setState({
        detail: undefined,
      });
    };
  }, [fileSetId]);

  // ------------------------------------------------------------ event handlers

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDetail({ name: e.target.value });
  };

  const handleAddNewRuleOfSet = async () => {
    const rule: Rule = {
      id: `${NEW_THING_ID_PREFIX_MARK}${Date.now()}`,
      filesSetId: id,
      regexContent: '',
      status: STATUS.ENABLE,
      matchType: MATCH_TYPE.DOMAIN,
    };
    detail.ruleList.push(rule);
    setDetail();
  };

  const handleRuleMatchTypeChange = ruleId => value => {
    const index = ruleList.findIndex(_ => _.id === ruleId);
    if (index > -1) {
      ruleList[index].matchType = value;
      setDetail({
        ruleList: [...ruleList],
      });
    }
  };

  const handleRuleToggleStatusClick = ruleId => value => {
    const index = ruleList.findIndex(_ => _.id === ruleId);
    if (index > -1) {
      ruleList[index].status = value;
      setDetail({
        ruleList: [...ruleList],
      });
    }
  };

  const handleRuleContentChange = ruleId => e => {
    const index = ruleList.findIndex(_ => _.id === ruleId);
    if (index > -1) {
      ruleList[index].regexContent = e.target.value;
      setDetail({
        ruleList: [...ruleList],
      });
    }
  };

  const handleClickDeleteRule = ruleId => () => {
    const index = ruleList.findIndex(_ => _.id === ruleId);
    if (index > -1) {
      setDetail({ ruleList: removeIndex(ruleList, index) });
    }
  };

  return (
    <Skeleton loading={detailLoading} paragraph={{ rows: 6 }}>
      {detail ? (
        <Spin spinning={saveLoading}>
          <Row gutter={16}>
            <Col md={12} sm={24}>
              <Form.Item label="Name" validateStatus={name ? '' : 'error'}>
                <Input value={name} onChange={handleNameChange} />
              </Form.Item>
            </Col>
            <Col md={12} sm={24}>
              <TopActions />
            </Col>
          </Row>
          <List
            dataSource={ruleList.length ? ruleList : ['add', ...ruleList]}
            rowKey="id"
            grid={{ gutter: 8, md: 2, sm: 1 }}
            bordered
            header={
              <>
                <Tooltip
                  placement="topLeft"
                  title="Matching rules follow JS RegExp. Matching type affects the matching range of a url."
                >
                  <Icon type="question-circle" />
                </Tooltip>{' '}
                Rule list
              </>
            }
            size="small"
            renderItem={(rule: Rule) => {
              if (typeof rule === 'string') {
                return (
                  <List.Item style={{ marginTop: 8 }}>
                    <Button
                      icon="plus"
                      type="dashed"
                      style={{
                        width: '100%',
                      }}
                      size="small"
                      onClick={handleAddNewRuleOfSet}
                    />
                  </List.Item>
                );
              }
              const {
                id: ruleId,
                regexContent,
                matchType,
                status: ruleStatus,
              } = rule;
              return (
                <List.Item style={{ marginTop: 8 }}>
                  <Row gutter={8}>
                    <Col md={14} sm={24}>
                      <Input
                        value={regexContent}
                        onChange={handleRuleContentChange(ruleId)}
                        placeholder="Write your regex here"
                        size="small"
                        disabled={ruleStatus === STATUS.DISABLE}
                      />
                    </Col>
                    <Col md={6} sm={16} xs={16}>
                      <Select
                        size="small"
                        value={matchType}
                        onChange={handleRuleMatchTypeChange(ruleId)}
                        style={{ width: '100%' }}
                      >
                        {renderOptions(MATCH_TYPE_OPTIONS())}
                      </Select>
                    </Col>
                    <Col md={4} sm={8} xs={8}>
                      <ToggleStatusButton
                        size="small"
                        value={ruleStatus}
                        onChange={handleRuleToggleStatusClick(ruleId)}
                      />
                      <Button
                        type="danger"
                        onClick={handleClickDeleteRule(ruleId)}
                        size="small"
                        icon="delete"
                      />
                    </Col>
                  </Row>
                </List.Item>
              );
            }}
          />
          <CodeList />
        </Spin>
      ) : (
        <Empty />
      )}
    </Skeleton>
  );
};
