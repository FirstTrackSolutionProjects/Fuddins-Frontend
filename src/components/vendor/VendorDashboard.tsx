import PartnerOperationsPanel from '../shared/PartnerOperationsPanel';
import type { User } from '../../types';

const VendorDashboard = ({ user }: { user: User }) => <PartnerOperationsPanel role="vendor" user={user} />;

export default VendorDashboard;
