import * as React from "react";
import { Component } from "react";

export class ActualReadings extends Component<IProps, {}> {
  render() {
    const stroom_dal = this.props.stroom_dal;
    const stroom_piek = this.props.stroom_piek;
    const gas = this.props.gas;

    return (
      <div>
        <h3>Meterstanden</h3>

        <table className="numeric-data">
          <thead>
            <tr>
              <th>Dal (kWh)</th>
              <th>Piek (kWh)</th>
              <th>
                Gas (m<sup>3</sup>)
              </th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>{stroom_dal}</td>
              <td>{stroom_piek}</td>
              <td>{gas}</td>
            </tr>
          </tbody>
        </table>
      </div>
    );
  }
}

interface IProps {
  stroom_dal: number;
  stroom_piek: number;
  gas: number;
}
