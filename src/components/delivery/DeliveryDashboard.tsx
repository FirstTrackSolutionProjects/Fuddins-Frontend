import PartnerOperationsPanel from '../shared/PartnerOperationsPanel';
import type { User } from '../../types';

const DeliveryDashboard = ({ user }: { user: User }) => <PartnerOperationsPanel role="delivery" user={user} />;

export default DeliveryDashboard;
