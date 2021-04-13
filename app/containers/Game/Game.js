import React, {useEffect, useState} from 'react';
import {css} from 'emotion';
import {Link} from 'react-router-dom';
import {connect} from 'react-redux';
import {Col, Row} from 'reactstrap';
import Localized from 'components/Localized/Localized';
import LocationsCount from 'components/LocationsCount/LocationsCount';
import {database} from 'services/firebase';
import {GAME_STATES} from 'consts';
import CogIcon from 'components/CogIcon/CogIcon';
import {logEvent} from 'utils/analytics';

import GamePlayers from './GamePlayers';
import GamePlayersController from './GamePlayersController';
import GameConfig from './GameConfig';
import GameInfo from './GameInfo';
import LocationsPopup from './LocationsPopup';
import GameManager from './GameManager';
import Room from './Room';


export const Game = ({roomId, roomConnected, state}) => {
  const [remotePlayers, setRemotePlayers] = useState({});
  const [showLocationsPopup, setShowLocationsPopup] = useState(false);

  useEffect(() => {
    if(roomConnected){
      logEvent('ROOM_CONNECTED_MASTER');
      const roomRemotePlayersRef = database.ref(`/roomsRemotePlayers/${roomId}`);
      roomRemotePlayersRef.on('value', (roomRemotePlayersSnapshot) => {
        setRemotePlayers(roomRemotePlayersSnapshot.val());
      });

      return () => roomRemotePlayersRef.off();
    }

    setRemotePlayers({});
  }, [roomConnected]);

  const started = state === GAME_STATES.STARTED;

  return (
    <div className={styles.container}>
      {!started &&
      <Row className={styles.locationsContainer}>
        <Col className="text-center">
          <a href="#" onClick={() => {setShowLocationsPopup(true)}}><Localized name="interface.game_locations" /> (<LocationsCount />)</a>
          <Link to="/settings"><CogIcon className={styles.cogIcon} /></Link>
        </Col>
      </Row>
      }
      <GamePlayers started={started} remotePlayers={remotePlayers} />
      {!started &&
        <React.Fragment>
          <GamePlayersController remotePlayers={remotePlayers} />
          <GameConfig />
        </React.Fragment>
      }
      {started &&
        <GameInfo />
      }
      <GameManager remotePlayers={remotePlayers} started={started} />
      <Room />
      <LocationsPopup isOpen={showLocationsPopup} toggle={() => setShowLocationsPopup(false)} />
    </div>
  );
};

const styles = {
  container: css({
    marginTop: 20,
  }),
  cogIcon: css({
    marginLeft: 5,
  }),
};

const mapStateToProps = (state) => ({
  roomId: state.room.id,
  roomConnected: state.session.roomConnected,
  state: state.game.state,
});

export default connect(mapStateToProps)(Game);
