import React, { Component } from 'react';
import accounting from 'accounting';
import './App.css';

export default class App extends Component {
    state = {
        lastPrice: -1,
        payload: {
            last: 0
        },
        form: {
            ripples: 0,
            investment: 0
        }
    }

    componentDidMount() {
        const form = localStorage.getItem('bitso_api_form');

        if (form) {
            this.setState({form: JSON.parse(form)});
        }
        
        this.getTickerPayload();
    }

    componentWillUpdate(nextProps, nextState) {
        localStorage.setItem('bitso_api_form', JSON.stringify(nextState.form));
    }

    getTickerPayload = async () => {
        try {
            const response = await fetch('/api/ticker');

            if (response.ok) {
                const data = await response.json();

                this.setState(state => {
                    let lastPrice = state.lastPrice;

                    // Update the last price only if the new one is different.
                    if (data.payload.last !== state.payload.last) {
                        lastPrice = state.payload.last;
                    }

                    return {payload: data.payload, lastPrice};
                });
            }
        } catch (err) {
            console.error(`Error loading ticker payload: ${err.message}`);
        }
        
        setTimeout(this.getTickerPayload, 5000);
    }

    handleChange = (e) => {
        const form = {...this.state.form};
        form[e.target.name] = e.target.value;

        this.setState({form});
    }

    getTotal = () => {
        return this.state.form.ripples * this.state.payload.last;
    }

    getLoss = () => {
        const investment = this.state.form.investment;

        if (this.getTotal() >= investment) {
            return 0;
        }

        return investment - this.getTotal();
    }

    getEarnings = () => {
        const investment = this.state.form.investment;

        if (this.getTotal() <= investment) {
            return 0;
        }

        return this.getTotal() - investment;
    }

    renderValueIndicator = (a, b) => {
        let indicator = '-';

        if (a > b) {
            indicator = '&uarr;'; // Higher
        }

        if (a < b) {
            indicator = '&darr;'; // Lower
        }
        
        return <span dangerouslySetInnerHTML={{__html: indicator}}></span>;
    }

    render() {
        return (
            <div className="container">
                <div className="text-center mt-5">
                    <h1>
                        {accounting.formatMoney(this.getTotal())} <small className="text-muted">MXN</small>
                    </h1>

                    <div>Earnings</div>
                    <h3 className="text-success">
                        {accounting.formatMoney(this.getEarnings())} <small className="text-muted">MXN</small>
                    </h3>

                    <div>Loss</div>
                    <h3 className="text-danger">
                        {accounting.formatMoney(this.getLoss())} <small className="text-muted">MXN</small>
                    </h3>
                </div>

                <div className="card text-center mt-5 mb-3">
                    <div className="card-body">

                        <label>Investment:</label>
                        <div className="input-group">
                            <input type="text" className="form-control" name="investment" value={this.state.form.investment} onChange={this.handleChange}/>
                            <div className="input-group-append">
                                <span className="input-group-text">MXN</span>
                            </div>
                        </div>

                        <label>Ripples:</label>
                        <div className="input-group">
                            <input type="text" className="form-control" name="ripples" value={this.state.form.ripples} onChange={this.handleChange}/>
                            <div className="input-group-append">
                                <span className="input-group-text">XRP</span>
                            </div>
                        </div>

                        <div className="my-3">
                            XRP: {accounting.formatMoney(this.state.payload.last)} <small className="text-muted">MXN</small> {this.renderValueIndicator(this.state.payload.last, this.state.lastPrice)}
                        </div>
                        <small className="text-muted">
                            Last update: {this.state.payload.created_at}
                        </small>
                    </div>
                </div>
            </div>
        );
    }
}
