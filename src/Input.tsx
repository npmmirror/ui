import React, { useMemo, useCallback } from 'react';
import Taro from '@tarojs/taro';
import classNames from 'classnames';
import { Input as _Input, Label, Text, View } from '@tarojs/components';
import { AtInputProps } from 'taro-ui/types/input';
import { ITouchEvent } from '@tarojs/components/types/common';
import { InputProps as _InputProps } from '@tarojs/components/types/Input';

import '../style/Input.scss';

export interface InputProps
  extends Pick<AtInputProps, 'title' | 'border' | 'clear'>,
    Pick<
      _InputProps,
      | 'value'
      | 'placeholder'
      | 'placeholderClass'
      | 'placeholderStyle'
      | 'disabled'
      | 'maxlength'
      | 'cursorSpacing'
      | 'confirmType'
      | 'cursor'
      | 'selectionStart'
      | 'selectionEnd'
      | 'adjustPosition'
      | 'autoFocus'
      | 'onConfirm'
    > {
  innerRef?: any;
  className?: string;
  style?: React.CSSProperties;
  type?: _InputProps['type'] | 'phone' | 'password';
  name?: string;
  required?: boolean;
  /** 最大输入长度，设置为 -1 的时候不限制最大长度 */
  maxLength?: number;
  readOnly?: boolean;
  error?: any;
  onChange?: _InputProps['onInput'];
  onFocus?: _InputProps['onFocus'];
  onBlur?: _InputProps['onBlur'];
  onClick?(event: ITouchEvent): any;
  onErrorClick?(error: any): void;
}

export const Input: React.FC<InputProps> = (props) => {
  const {
    innerRef,
    className,
    style = {},
    children,
    type = 'text',
    name,
    title,
    value,
    placeholder,
    placeholderClass,
    placeholderStyle,
    disabled,
    required,
    readOnly,
    autoFocus,
    cursorSpacing = 50,
    cursor = 0,
    selectionStart = -1,
    selectionEnd = -1,
    adjustPosition = true,
    confirmType = 'done',
    border = true,
    error,
    clear,
  } = props;
  const maxlength = props.maxlength ?? props.maxLength ?? 140;

  const onInput = useCallback<_InputProps['onInput']>(
    (e) => {
      props.onChange && props.onChange(e);
    },
    [props.onChange]
  );

  const onFocus = useCallback<_InputProps['onFocus']>(
    (e) => {
      props.onFocus && props.onFocus(e);
    },
    [props.onFocus]
  );

  const onBlur = useCallback<_InputProps['onBlur']>(
    (e) => {
      props.onBlur && props.onBlur(e);
    },
    [props.onBlur]
  );

  const onConfirm = useCallback<_InputProps['onConfirm']>(
    (e) => {
      props.onConfirm && props.onConfirm(e);
    },
    [props.onConfirm]
  );

  const onClick = useCallback<_InputProps['onClick']>(
    (e) => {
      props.readOnly && props.onClick && props.onClick(e);
    },
    [props.readOnly, props.onClick]
  );

  const onClearClick = useCallback((event: ITouchEvent) => {
    // fix #840
    setTimeout(() => {
      event.detail.value = '';
      props.onChange && props.onChange(event);
    }, 50);
  }, []);

  const onErrorClick = useCallback(() => {
    if (props.error) {
      if (props.onErrorClick) {
        props.onErrorClick(props.error);
      } else {
        Taro.showToast({ title: props.error, icon: 'none' });
      }
    }
  }, [props.error, props.onErrorClick]);

  const normalizedProps = useMemo(() => {
    const obj = {
      type,
      maxlength,
      disabled: !!readOnly,
      password: false,
    };

    switch (obj.type) {
      case 'phone':
        obj.type = 'number';
        obj.maxlength = 11;
        break;
      case 'password':
        obj.type = 'text';
        obj.password = true;
        break;
      default:
        break;
    }

    const normalizedProps = { ...obj, type: obj.type as _InputProps['type'] };

    // if (normalizedProps.maxLength) {
    //     // BUG 当前 taro 3.0.0-beta.6 会以驼峰式设置 'maxLength' 属性, 但小程序真正需要的是小写 'maxlength'.
    //     normalizedProps['maxlength'] = normalizedProps.maxLength
    // }

    return normalizedProps;

    // return { ...normalizedProps, type: normalizedProps.type as _InputProps['type'] }
  }, [type, maxlength, readOnly]);

  return (
    <View className={classNames('at-input', { 'at-input--without-border': !border }, className)} style={style}>
      <View
        className={classNames('at-input__container', {
          'at-input--error': error,
          'at-input--disabled': disabled,
        })}
      >
        <View
          className={classNames('at-input__overlay', {
            'at-input__overlay--hidden': !disabled,
          })}
          onClick={onClick}
        ></View>
        {title && (
          <Label className={classNames('at-input__title', { ['at-input__title--required']: required })} for={name}>
            {title}
          </Label>
        )}
        <_Input
          ref={(node) => {
            // node 偶尔为 null
            if (node && innerRef) {
              // 赋值 name 后更像 input.
              if (!node.name && name) {
                node.name = name;
              }
              innerRef({ ...node, name, type });
            }
          }}
          className="at-input__input"
          id={name}
          name={name}
          placeholder={placeholder}
          placeholderClass={classNames('placeholder', placeholderClass)}
          placeholderStyle={placeholderStyle}
          cursorSpacing={cursorSpacing}
          autoFocus={autoFocus}
          focus={autoFocus}
          value={value}
          confirmType={confirmType}
          cursor={cursor}
          selectionStart={selectionStart}
          selectionEnd={selectionEnd}
          adjustPosition={adjustPosition}
          onInput={onInput}
          onFocus={onFocus}
          onBlur={onBlur}
          onConfirm={onConfirm}
          {...normalizedProps}
        />
        {clear && value && (
          <View className="at-input__icon" onTouchEnd={onClearClick}>
            <Text className="at-icon at-icon-close-circle at-input__icon-close"></Text>
          </View>
        )}
        {error && (
          <View className="at-input__icon" onTouchStart={onErrorClick}>
            <Text className="at-icon at-icon-alert-circle at-input__icon-alert"></Text>
          </View>
        )}
        <View className="at-input__children">{children}</View>
      </View>
    </View>
  );
};
