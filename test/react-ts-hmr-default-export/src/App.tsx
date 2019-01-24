import React from "react";
import { render } from "react-dom";
import { hot } from "react-hot-loader";

import "./styles.scss";

type CounterState = { value: number };

class Counter extends React.Component<{}, CounterState> {
  state = { value: 0 };

  handleIncrement = () => {
    this.setState(({ value }) => ({ value: value + 1 }));
  }

  handleDecrement = () => {
    this.setState(({ value }) => ({ value: value - 1 }));
  }

  render() {
    const { value } = this.state;

    return (
      <div>
        <button onClick={this.handleDecrement}>-</button>
        <span>{value}</span>
        <button onClick={this.handleIncrement}>+</button>
      </div>
    );
  }
}

const Message = () => <header>Hiz!</header>;

const App = () => (
  <main>
    <Message />
    <Counter />
  </main>
);

export default hot(module)(App);
