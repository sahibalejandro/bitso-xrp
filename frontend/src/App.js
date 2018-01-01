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
            <div className="flex h-screen text-grey-darkest">
                <div className="border-r p-8">
                    <div className="mb-8">
                        <label className="block mb-4 text-xl">Investment:</label>
                        <div className="flex">
                            <input className="border border-r-0 rounded-l-lg p-3 text-xl" type="text" name="investment" value={this.state.form.investment} onChange={this.handleChange}/>
                            <div className="border rounded-r-lg p-3 text-xl">MXN</div>
                        </div>
                    </div>
                    <div className="mb-8">
                        <label className="block mb-4 text-xl">Ripples:</label>
                        <div className="flex">
                            <input className="border border-r-0 rounded-l-lg p-3 text-xl" type="text" name="ripples" value={this.state.form.ripples} onChange={this.handleChange}/>
                            <div className="border rounded-r-lg p-3 text-xl">XRP</div>
                        </div>
                    </div>
                    <div className="text-xl mb-4">
                        XRP: {accounting.formatMoney(this.state.payload.last)} <span className="text-sm">MXN</span> {this.renderValueIndicator(this.state.payload.last, this.state.lastPrice)}
                    </div>
                    <div class="text-lg text-grey">
                        Last update: {this.state.payload.created_at}
                    </div>
                </div>
                <div className="flex-1">
                    <div className="text-center" style={{fontSize: '10rem', margin: '10rem 0'}}>
                        {accounting.formatMoney(this.getTotal())} <span className="text-grey text-5xl">MXN</span>
                    </div>
                    <div className="flex text-5xl">
                        <div className="flex-1 text-center">
                            <div className="text-grey">Loss</div>
                            <div className="text-red-light">
                                {accounting.formatMoney(this.getLoss())} <span className="text-red-lighter text-xl">MXN</span>
                            </div>
                        </div>
                        <div className="flex-1 text-center">
                            <div className="text-grey">Earnings</div>
                            <div className="text-green-dark">
                                {accounting.formatMoney(this.getEarnings())} <span className="text-green text-xl">MXN</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}
