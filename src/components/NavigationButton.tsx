import * as React from "react";
import { Component } from "react";

interface IProps {
  enabled: boolean;
  label: string;

  onClick: () => void;
}

export class NavigationButton extends Component<IProps, {}> {
  render() {
    return (
      <button
        onClick={this.onClick.bind(this)}
        disabled={!this.props.enabled}
        className="NavigationButton"
      >
        {this.props.label}
      </button>
    );
  }

  onClick() {
    this.props.onClick();
  }
}
