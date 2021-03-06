import { hashHistory } from '@/components/hashHistory';
import {
  EXTENSION_GLOBAL_OPTIONS_KEY,
  ExtensionGlobalOptions,
  STATUS,
} from '@/interfaces/entities';
import { AnyFunc } from '@/interfaces/utils';
import { Home } from '@/options/Home';
import { SetDetail } from '@/options/SetDetail';
import { Setting } from '@/options/Setting';
import { useStore } from '@/options/store';
import { Alert, BackTop, Icon, Layout, Menu } from 'antd';
import { AlertProps } from 'antd/lib/alert';
import * as React from 'react';
import { Link, Route, Router, Switch, withRouter } from 'react-router-dom';
import { useMappedState } from 'redux-react-hook';
import * as styles from './style.module.less';

const { Header, Content, Footer } = Layout;
const { useEffect, useState, useCallback } = React;

interface RouteConfg {
  name?: string;
  path: string;
  component: React.ComponentType;
}

interface MenuConfig {
  name: string;
  path: string;
  icon?: string;
  render?: React.ComponentType;
  activePaths?: string[];
  children?: MenuConfig[];
}

const routes: RouteConfg[] = [
  {
    path: '/',
    component: Home,
  },
  {
    path: '/set-detail',
    component: SetDetail,
  },
  {
    path: '/setting',
    component: Setting,
  },
];

const menus: MenuConfig[] = [
  {
    name: 'Home',
    path: '/',
    activePaths: ['/', '/set-detail'],
  },
  {
    name: 'Setting',
    path: '/setting',
  },
];

const mapState = () =>
  useCallback<
    AnyFunc<{
      globalAlertTip: {
        show: boolean;
        alertProps: AlertProps;
      };
      globalOptions: ExtensionGlobalOptions;
    }>
  >(
    _ => ({
      globalAlertTip: _.options.globalAlertTip,
      globalOptions: _.all.globalOptions,
    }),
    [],
  );

const CustomHeader = withRouter(({ history: h }) => {
  const { pathname } = h.location;
  const [selectedKeys, setSelectedKeys] = useState<string[]>([]);
  const { dispatch } = useStore();
  const { globalAlertTip, globalOptions } = useMappedState(mapState());

  const extensionStatus = globalOptions[EXTENSION_GLOBAL_OPTIONS_KEY.status];

  useEffect(() => {
    if (extensionStatus === STATUS.DISABLE) {
      dispatch.options.openGlobalAlertTip({
        message: `${
          DEFINE.displayName
        } has been disabled now. Turn it on when you want to use it`,
        type: 'warning',
      });
    } else {
      dispatch.options.resetGlobalAlertTip();
    }
  }, [extensionStatus]);

  useEffect(() => {
    const targetItem = menus.find(
      _ => _.path === pathname || (_.activePaths || []).includes(pathname),
    );
    // default '/'
    setSelectedKeys([targetItem ? targetItem.path : '/']);
  }, [pathname]);

  return (
    <Header className={styles.header}>
      <Menu
        theme="light"
        mode="horizontal"
        className={styles.menu}
        selectedKeys={selectedKeys}
      >
        {menus.map(function traverse(item) {
          const { name, path, icon, render: CustomRender, children } = item;
          const hasNotEmptyChildren = children && children.length;
          const defaultRenderText = (
            <>
              {icon && <Icon type={icon} />}
              {name}
            </>
          );
          const renderItem = CustomRender ? (
            <CustomRender />
          ) : hasNotEmptyChildren ? (
            // has children can not be clicked
            defaultRenderText
          ) : (
            <Link to={path}>{defaultRenderText}</Link>
          );
          if (hasNotEmptyChildren) {
            return (
              <Menu.SubMenu key={`${path}-${name}`} title={renderItem}>
                {children.map(traverse)}
              </Menu.SubMenu>
            );
          }

          return <Menu.Item key={path}>{renderItem}</Menu.Item>;
        })}
      </Menu>

      {globalAlertTip.show && (
        <Alert {...globalAlertTip.alertProps} style={{ marginTop: 10 }} />
      )}
    </Header>
  );
});

export const RouterLayout: React.SFC = () => {
  return (
    <Router history={hashHistory}>
      <Layout className={styles.wrap}>
        <CustomHeader />
        <Content className={styles.content}>
          <Switch>
            {routes.map(r => (
              <Route exact key={r.path} path={r.path} component={r.component} />
            ))}
          </Switch>
        </Content>
        <Footer style={{ textAlign: 'center' }}>
          {DEFINE.displayName}@{DEFINE.version} - {new Date().getFullYear()}{' '}
          <Icon type="rocket" />{' '}
          <a href="https://github.com/daief/inject-code" target="_blank">
            daief
          </a>
        </Footer>
        <BackTop />
      </Layout>
    </Router>
  );
};
