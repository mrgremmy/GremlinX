import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Layout } from './components/layout/Layout.tsx';
import { ExplorePage } from './pages/ExplorePage.tsx';
import { NFTDetailPage } from './pages/NFTDetailPage.tsx';
import { CollectionPage } from './pages/CollectionPage.tsx';
import { ProfilePage } from './pages/ProfilePage.tsx';
import { PublishPage } from './pages/PublishPage.tsx';
import { TermsPage } from './pages/TermsPage.tsx';
import { PrivacyPage } from './pages/PrivacyPage.tsx';

/** Root router — all routes wrapped in a shared Layout shell. */
export function App(): JSX.Element {
    return (
        <BrowserRouter>
            <Routes>
                <Route element={<Layout />}>
                    <Route index element={<ExplorePage />} />
                    <Route path="explore" element={<ExplorePage />} />
                    <Route path="publish" element={<PublishPage />} />
                    <Route path="collection/:address" element={<CollectionPage />} />
                    <Route path="collection/:address/:tokenId" element={<NFTDetailPage />} />
                    <Route path="profile" element={<ProfilePage />} />
                    <Route path="profile/:address" element={<ProfilePage />} />
                    <Route path="terms" element={<TermsPage />} />
                    <Route path="privacy" element={<PrivacyPage />} />
                    <Route path="*" element={<ExplorePage />} />
                </Route>
            </Routes>
        </BrowserRouter>
    );
}
