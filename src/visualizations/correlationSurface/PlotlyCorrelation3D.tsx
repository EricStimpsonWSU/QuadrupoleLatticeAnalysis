import React, { useEffect, useState } from 'react';
import Plot from 'react-plotly.js';
import ButtonGroup from 'react-bootstrap/ButtonGroup';
import ButtonToolbar from 'react-bootstrap/ButtonToolbar';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import Button from 'react-bootstrap/Button';
import ToggleButton from 'react-bootstrap/ToggleButton';
import ToggleButtonGroup from 'react-bootstrap/ToggleButtonGroup';

interface ICorrData {
    beta: number;
    disorder: number;
    corrFQs: number;
    corrFQs_quench: number;
    corrFQs_anneal: number;
    corrFQm: number;
    corrFQm_quench: number;
    corrFQm_anneal: number;
    corrFQl: number;
    corrFQl_quench: number;
    corrFQl_anneal: number;
    corrAFQs: number;
    corrAFQs_quench: number;
    corrAFQs_anneal: number;
    corrAFQm: number;
    corrAFQm_quench: number;
    corrAFQm_anneal: number;
    corrAFQl: number;
    corrAFQl_quench: number;
    corrAFQl_anneal: number;
}

interface IGraphData {
    betas: number[];
    disorders: number[];
    corrFQ: number[][];
    corrAFQ: number[][];
}

enum RangeSelection {
    SHORT,
    MEDIUM,
    LONG,
}

enum DataSetSelection {
    ANNEALED,
    QUENCHED,
    COMBINED,
}

enum OrderParameterSelection {
    FQ,
    AFQ,
    BOTH,
}

const radiiDescriptions = [
    '1.41 to 4.00 [short range]',
    '4.24 to 10.00 [medium range]',
    '10.20 to 22.09 [long range]',
];

export default function PlotlyCorrelation3D() {
    const [range, setRange] = useState<RangeSelection>(RangeSelection.SHORT);
    const [dataSet, setDataSet] = useState<DataSetSelection>(
        DataSetSelection.COMBINED,
    );
    const [orderParameter, setOrderParameter] =
        useState<OrderParameterSelection>(OrderParameterSelection.BOTH);

    const [corrData, setCorrData] = useState<ICorrData[]>([]);
    const [graphData, setGraphData] = useState<IGraphData>();
    const [plotTitle, setPlotTitle] = useState('');

    useEffect(() => {
        const toGraphData = (corrData: ICorrData[]) => {
            corrData = corrData.sort((a, b) => {
                if (a.disorder < b.disorder) return -1;
                if (a.disorder > b.disorder) return 1;
                return a.beta < b.beta ? -1 : 1;
            });
            var betas = [
                ...new Set(corrData.map((corrDataPoint) => corrDataPoint.beta)),
            ];
            var disorders = [
                ...new Set(
                    corrData.map((corrDataPoint) => corrDataPoint.disorder),
                ),
            ];

            var corrFQ_data: number[] = [],
                corrAFQ_data: number[] = [];

            var corrFQMatrix: number[][] = [],
                corrAFQMatrix: number[][] = [];

            if (
                orderParameter === OrderParameterSelection.BOTH ||
                orderParameter === OrderParameterSelection.FQ
            ) {
                corrFQ_data = corrData.map((corrDataPoint) => {
                    var ts, tm, tl;
                    switch (dataSet) {
                        case DataSetSelection.ANNEALED:
                            ts = corrDataPoint.corrFQs_anneal;
                            tm = corrDataPoint.corrFQm_anneal;
                            tl = corrDataPoint.corrFQl_anneal;
                            break;
                        case DataSetSelection.QUENCHED:
                            ts = corrDataPoint.corrFQs_quench;
                            tm = corrDataPoint.corrFQm_quench;
                            tl = corrDataPoint.corrFQl_quench;
                            break;
                        default:
                            ts = corrDataPoint.corrFQs;
                            tm = corrDataPoint.corrFQm;
                            tl = corrDataPoint.corrFQl;
                            break;
                    }
                    switch (range) {
                        case RangeSelection.SHORT:
                            return ts;
                        case RangeSelection.MEDIUM:
                            return tm;
                        case RangeSelection.LONG:
                            return tl;
                        default:
                            return ts;
                    }
                });

                for (let index = 0; index < disorders.length; index++) {
                    corrFQMatrix.push(
                        corrFQ_data.slice(
                            index * betas.length,
                            (index + 1) * betas.length,
                        ),
                    );
                }
            }

            if (
                orderParameter === OrderParameterSelection.BOTH ||
                orderParameter === OrderParameterSelection.AFQ
            ) {
                corrAFQ_data = corrData.map((corrDataPoint) => {
                    var ts, tm, tl;
                    switch (dataSet) {
                        case DataSetSelection.ANNEALED:
                            ts = corrDataPoint.corrAFQs_anneal;
                            tm = corrDataPoint.corrAFQm_anneal;
                            tl = corrDataPoint.corrAFQl_anneal;
                            break;
                        case DataSetSelection.QUENCHED:
                            ts = corrDataPoint.corrAFQs_quench;
                            tm = corrDataPoint.corrAFQm_quench;
                            tl = corrDataPoint.corrAFQl_quench;
                            break;
                        default:
                            ts = corrDataPoint.corrAFQs;
                            tm = corrDataPoint.corrAFQm;
                            tl = corrDataPoint.corrAFQl;
                            break;
                    }
                    switch (range) {
                        case RangeSelection.SHORT:
                            return ts;
                        case RangeSelection.MEDIUM:
                            return tm;
                        case RangeSelection.LONG:
                            return tl;
                        default:
                            return ts;
                    }
                });
                for (let index = 0; index < disorders.length; index++) {
                    corrAFQMatrix.push(
                        corrAFQ_data.slice(
                            index * betas.length,
                            (index + 1) * betas.length,
                        ),
                    );
                }
            }

            setGraphData({
                betas: betas,
                disorders: disorders,
                corrFQ: corrFQMatrix,
                corrAFQ: corrAFQMatrix,
            });
            setPlotTitle(`${
                dataSet === DataSetSelection.COMBINED
                    ? 'Combined'
                    : dataSet === DataSetSelection.ANNEALED
                    ? 'Annealed'
                    : 'Quenched'
            } ${
                orderParameter === OrderParameterSelection.BOTH
                    ? 'FQ/AFQ'
                    : orderParameter === OrderParameterSelection.FQ
                    ? 'FQ'
                    : 'AFQ'
            } Correlation:<br>
            ${radiiDescriptions[range]}`);
        };

        const getData = () => {
            fetch('data/32x48x48.allCombined.maxSteps.ranged.json')
                .then((res) => res.json())
                .then((data) => {
                    setCorrData(data);
                    toGraphData(data);
                });
        };
        getData();
    }, [range, dataSet, orderParameter]);

    const handleRangeChange = (val: any) => setRange(val);

    return (
        <>
            <ToggleButtonGroup
                type="radio"
                name="rangeOptions"
                value={range}
                onChange={handleRangeChange}
            >
                <ToggleButton
                    id="rangeOptions-btn-1"
                    variant="secondary"
                    value={RangeSelection.SHORT}
                    size="sm"
                >
                    Short
                </ToggleButton>
                <ToggleButton
                    id="rangeOptions-btn-2"
                    variant="secondary"
                    value={RangeSelection.MEDIUM}
                    size="sm"
                >
                    Medium
                </ToggleButton>
                <ToggleButton
                    id="rangeOptions-btn-3"
                    variant="secondary"
                    value={RangeSelection.LONG}
                    size="sm"
                >
                    Long
                </ToggleButton>
            </ToggleButtonGroup>
            <br />
            <ToggleButtonGroup
                type="radio"
                name="dataSetOptions"
                value={dataSet}
                onChange={(val: any) => setDataSet(val)}
            >
                <ToggleButton
                    id="dataSetOptions-btn-1"
                    variant="secondary"
                    value={DataSetSelection.COMBINED}
                    size="sm"
                >
                    Combined
                </ToggleButton>
                <ToggleButton
                    id="dataSetOptions-btn-2"
                    variant="secondary"
                    value={DataSetSelection.ANNEALED}
                    size="sm"
                >
                    Annealed
                </ToggleButton>
                <ToggleButton
                    id="dataSetOptions-btn-3"
                    variant="secondary"
                    value={DataSetSelection.QUENCHED}
                    size="sm"
                >
                    Quenched
                </ToggleButton>
            </ToggleButtonGroup>
            <br />
            {!!graphData && (
                <>
                    <Plot
                        data={[
                            {
                                opacity: 1,

                                y: graphData!.disorders,
                                x: graphData!.betas,
                                z: graphData!.corrAFQ,

                                colorscale: [
                                    [0.0, '#d1efea'],
                                    [1.0, '#2a5674'],
                                ],

                                colorbar: {
                                    x: -0.17,
                                    title: 'AFQ',
                                },

                                zmin: 0,
                                zmax: 1,

                                type: 'surface',
                            },
                            {
                                opacity: 1,

                                y: graphData!.disorders,
                                x: graphData!.betas,
                                z: graphData!.corrFQ,

                                colorscale: [
                                    [0.0, '#f3cbd3'],
                                    [1.0, '#6c2167'],
                                ],

                                colorbar: {
                                    x: -0.27,
                                    title: 'FQ',
                                },

                                zmin: 0,
                                zmax: 1,

                                type: 'surface',
                            },
                        ]}
                        layout={{
                            title: {
                                text: plotTitle,
                                x: 0.5,
                                y: 0.95,
                            },
                            autosize: false,
                            width: 1024,
                            height: 800,
                            margin: { t: 10, b: 10, l: 10, r: 10 },
                            scene: {
                                xaxis: {
                                    title: 'Beta           ',
                                },
                                yaxis: {
                                    title: {
                                        text: 'Disorder',
                                    },
                                },
                                zaxis: {
                                    title: 'corr            ',
                                },
                            },
                        }}
                    />
                </>
            )}
        </>
    );
}
