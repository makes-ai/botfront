import React from 'react';
import { Container } from 'semantic-ui-react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { OrderedMap } from 'immutable';
import { useDrop } from 'react-dnd-cjs';
import { setAnalyticsCardSettings, swapAnalyticsCards } from '../../store/actions/actions';
import AnalyticsCard from './AnalyticsCard';
import conversationLengths from '../../../api/graphql/conversations/queries/conversationLengths.graphql';
import conversationDurations from '../../../api/graphql/conversations/queries/conversationDurations.graphql';
import intentFrequencies from '../../../api/graphql/conversations/queries/intentFrequencies.graphql';
import visitCounts from '../../../api/graphql/conversations/queries/visitCounts.graphql';
import fallbackCounts from '../../../api/graphql/conversations/queries/fallbackCounts.graphql';

function AnalyticsDashboard(props) {
    const {
        projectId, environment, cardSettings, changeCardSettings, swapCards,
    } = props;

    const envs = [environment];
    if (environment === 'development') envs.push(null);

    const cards = {
        conversationLengths: {
            chartTypeOptions: ['bar', 'pie'],
            title: 'Conversation Length',
            titleDescription: 'The number of user utterances contained in a conversation.',
            queryParams: { projectId, envs, queryName: 'conversationLengths' },
            query: conversationLengths,
            graphParams: {
                x: 'length',
                y: [{ abs: 'count', rel: 'frequency' }],
                formats: {
                    length: v => `${v} utterance${v !== 1 ? 's' : ''}`,
                },
            },
        },
        intentFrequencies: {
            chartTypeOptions: ['bar', 'pie'],
            title: 'Top 10 Intents',
            titleDescription: 'The number of user utterances classified as having a given intent.',
            queryParams: { projectId, envs, queryName: 'intentFrequencies' },
            query: intentFrequencies,
            graphParams: {
                x: 'name',
                y: [{ abs: 'count', rel: 'frequency' }],
                axisBottom: { tickRotation: -25 },
            },
        },
        conversationDurations: {
            chartTypeOptions: ['bar', 'pie'],
            title: 'Conversation Duration',
            titleDescription: 'The number of seconds elapsed between the first and the last message of a conversation.',
            queryParams: { projectId, envs, queryName: 'conversationDurations' },
            query: conversationDurations,
            graphParams: {
                x: 'duration',
                y: [{ abs: 'count', rel: 'frequency' }],
                formats: {
                    duration: v => `${v} s`,
                },
            },
        },
        fallbackCounts: {
            chartTypeOptions: ['line'],
            title: 'Fallback',
            titleDescription: 'The number of times the bot uttered fallback (out of all bot utterances).',
            queryParams: {
                temporal: true, envs, projectId, queryName: 'responseCounts',
            },
            query: fallbackCounts,
            graphParams: {
                x: 'bucket',
                y: [{ abs: 'count', rel: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    proportion: v => `${v}%`,
                },
                rel: { y: [{ abs: 'proportion' }] },
            },
        },
        visitCounts: {
            chartTypeOptions: ['line'],
            title: 'Visits & Engagement',
            titleDescription: 'Visits: the total number of conversations in a given temporal window. Engagements: of those conversations, those with length one or more.',
            queryParams: {
                temporal: true, projectId, envs, queryName: 'conversationCounts',
            },
            query: visitCounts,
            graphParams: {
                x: 'bucket',
                y: [{ abs: 'count' }, { abs: 'engagements', rel: 'proportion' }],
                formats: {
                    bucket: v => v.toLocaleDateString(),
                    count: v => `${v} visit${v !== 1 ? 's' : ''}`,
                    engagements: v => `${v} engagement${v !== 1 ? 's' : ''}`,
                    proportion: v => `${v}%`,
                },
                rel: { y: [{ abs: 'proportion' }] },
            },
        },
    };
    
    const [, drop] = useDrop({ accept: 'card' });

    return (
        <Container className='analytics-container'>
            <div className='analytics-dashboard' ref={drop}>
                {cardSettings.entrySeq().map(([cardName, settings]) => (
                    <AnalyticsCard
                        key={cardName}
                        cardName={cardName}
                        {...cards[cardName]}
                        settings={settings.toJS()}
                        onChangeSettings={(setting, value) => changeCardSettings(cardName, setting, value)}
                        onReorder={swapCards}
                    />
                ))}
            </div>
        </Container>
    );
}

AnalyticsDashboard.propTypes = {
    projectId: PropTypes.string.isRequired,
    environment: PropTypes.string.isRequired,
    cardSettings: PropTypes.instanceOf(OrderedMap).isRequired,
    changeCardSettings: PropTypes.func.isRequired,
    swapCards: PropTypes.func.isRequired,
};

AnalyticsDashboard.defaultProps = {};

const mapStateToProps = state => ({
    projectId: state.settings.get('projectId'),
    environment: state.settings.get('workingDeploymentEnvironment'),
    cardSettings: state.analytics.get('cardSettings'),
});

const mapDispatchToProps = {
    changeCardSettings: setAnalyticsCardSettings,
    swapCards: swapAnalyticsCards,
};

export default connect(mapStateToProps, mapDispatchToProps)(AnalyticsDashboard);
