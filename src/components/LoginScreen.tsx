import { makeAutoObservable } from "mobx";
import { observer } from "mobx-react";

import * as React from "react";
import { Component } from "react";

import { LoginScreenStore } from "../stores/LoginScreenStore";

interface IProps {
    loginSuccessful: () => void;
}

const LoginScreen = observer(
    class LoginScreen extends Component<IProps> {
        store: LoginScreenStore;

        constructor(props: IProps) {
            super(props);

            makeAutoObservable(this);

            this.store = new LoginScreenStore("user", "pass");
        }

        render() {
            const { error } = this.store;

            const errorMessage = error ? <div className="error-message">{error}</div> : "";

            return (
                <div className="login-dialog">
                    {errorMessage}
                    <label htmlFor="username">Username</label>
                    <input
                        type="text"
                        id="username"
                        name="username"
                        placeholder="Username"
                        onChange={this.onUsernameChange}
                        onKeyDown={this.onFieldKeydown}
                    />

                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        placeholder="Password"
                        onChange={this.onPasswordChange}
                        onKeyDown={this.onFieldKeydown}
                    />

                    <button disabled={!this.store.isValid} onClick={this.onClick}>
                        Submit
                    </button>
                </div>
            );
        }

        onUsernameChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            this.store.username = event.target.value;
            this.store.error = null;
        };

        onPasswordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
            this.store.password = event.target.value;
            this.store.error = null;
        };

        onClick = () => {
            this.submit();
        };

        onFieldKeydown = (event: React.KeyboardEvent<HTMLInputElement>) => {
            if (event.keyCode === 13) {
                this.submit();
            }
        };

        submit() {
            this.store.submit().then(() => {
                this.props.loginSuccessful();
            });
        }
    }
);

export { LoginScreen };
