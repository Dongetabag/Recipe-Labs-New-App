import React, { useState, useRef, useEffect } from 'react';
import {
  Users, MessageCircle, FileText, Send, Paperclip, Search,
  MoreHorizontal, Phone, Video, Hash, Plus, Upload, Download,
  Image, File, X, Check, Circle, UserPlus, Settings, Bell,
  Smile, AtSign, ChevronRight, FolderOpen, Trash2, Eye, ChevronLeft
} from 'lucide-react';
import { useTeam, useMessages, useDocuments, useCurrentUser, useChannels } from '../hooks/useAppStore';
import { User, Message, Document, Channel } from '../services/appStore';

const TeamModule: React.FC = () => {
  const { users, onlineCount } = useTeam();
  const { user: currentUser } = useCurrentUser();
  const { channels } = useChannels();
  const { documents, uploadDocument, deleteDocument } = useDocuments();

  const [activeTab, setActiveTab] = useState<'chat' | 'members' | 'files'>('chat');
  const [selectedChannel, setSelectedChannel] = useState<string>('general');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showSidebar, setShowSidebar] = useState(false);

  // Close sidebar when selecting a channel/user on mobile
  const handleSelectChannel = (channelId: string) => {
    setSelectedChannel(channelId);
    setSelectedUser(null);
    setShowSidebar(false);
  };

  const handleSelectUser = (user: User) => {
    setSelectedUser(user);
    setSelectedChannel('');
    setShowSidebar(false);
  };

  return (
    <div className="flex h-full animate-fadeIn overflow-hidden bg-[#050505] relative">
      {/* Mobile Sidebar Overlay */}
      {showSidebar && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden"
          onClick={() => setShowSidebar(false)}
        />
      )}

      {/* Left Sidebar - Channels & DMs */}
      <div className={`
        fixed md:relative inset-y-0 left-0 z-50
        w-72 md:w-64 border-r border-white/5 flex flex-col bg-black/95 md:bg-black/40
        transform transition-transform duration-300 ease-in-out
        ${showSidebar ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        {/* Header */}
        <div className="p-4 border-b border-white/5 flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-white">Team Hub</h2>
            <p className="text-xs text-gray-500">{onlineCount} of {users.length} online</p>
          </div>
          <button 
            className="md:hidden p-2 text-gray-400 hover:text-white"
            onClick={() => setShowSidebar(false)}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex border-b border-white/5">
          {[
            { id: 'chat', label: 'Chat', icon: <MessageCircle className="w-4 h-4" /> },
            { id: 'members', label: 'Team', icon: <Users className="w-4 h-4" /> },
            { id: 'files', label: 'Files', icon: <FileText className="w-4 h-4" /> }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 p-3 flex items-center justify-center gap-2 text-xs font-medium transition-colors touch-manipulation ${
                activeTab === tab.id
                  ? 'text-brand-gold border-b-2 border-brand-gold bg-brand-gold/5'
                  : 'text-gray-500 hover:text-white active:bg-white/10'
              }`}
            >
              {tab.icon}
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Content based on tab */}
        <div className="flex-1 overflow-y-auto overscroll-contain">
          {activeTab === 'chat' && (
            <div className="p-2 space-y-4">
              {/* Channels */}
              <div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Channels</span>
                  <button className="p-2 text-gray-500 hover:text-brand-gold touch-manipulation">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
                {channels.map(channel => (
                  <button
                    key={channel.id}
                    onClick={() => handleSelectChannel(channel.id)}
                    className={`w-full flex items-center gap-2 px-3 py-3 rounded-lg text-left transition-colors touch-manipulation active:scale-[0.98] ${
                      selectedChannel === channel.id && !selectedUser
                        ? 'bg-brand-gold/10 text-brand-gold'
                        : 'text-gray-400 hover:bg-white/5 active:bg-white/10 hover:text-white'
                    }`}
                  >
                    <Hash className="w-4 h-4" />
                    <span className="text-sm">{channel.name}</span>
                  </button>
                ))}
              </div>

              {/* Direct Messages */}
              <div>
                <div className="px-2 py-1 flex items-center justify-between">
                  <span className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">Direct Messages</span>
                </div>
                {users.filter(u => u.id !== currentUser?.id).map(user => (
                  <button
                    key={user.id}
                    onClick={() => handleSelectUser(user)}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-lg text-left transition-colors touch-manipulation active:scale-[0.98] ${
                      selectedUser?.id === user.id
                        ? 'bg-brand-gold/10 text-brand-gold'
                        : 'text-gray-400 hover:bg-white/5 active:bg-white/10 hover:text-white'
                    }`}
                  >
                    <div className="relative">
                      <img
                        src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                        alt={user.name}
                        className="w-10 h-10 rounded-lg"
                      />
                      <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
                        user.status === 'online' ? 'bg-green-500' :
                        user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                      }`} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm truncate">{user.name}</p>
                      <p className="text-[10px] text-gray-500 truncate">{user.role}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'members' && (
            <div className="p-4 space-y-3">
              {users.map(user => (
                <div
                  key={user.id}
                  className="flex items-center gap-3 p-3 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation"
                >
                  <div className="relative">
                    <img
                      src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
                      alt={user.name}
                      className="w-12 h-12 rounded-xl"
                    />
                    <div className={`absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-[#0a0a0a] ${
                      user.status === 'online' ? 'bg-green-500' :
                      user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
                    }`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-white truncate">{user.name}</p>
                    <p className="text-[10px] text-gray-500">{user.role || user.department}</p>
                  </div>
                  {user.id !== currentUser?.id && (
                    <button
                      onClick={() => { handleSelectUser(user); setActiveTab('chat'); }}
                      className="p-3 text-gray-500 hover:text-brand-gold active:text-brand-gold rounded-lg hover:bg-white/5 active:bg-white/10 touch-manipulation"
                    >
                      <MessageCircle className="w-5 h-5" />
                    </button>
                  )}
                </div>
              ))}
              {users.length === 0 && (
                <div className="text-center py-8">
                  <Users className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No team members yet</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'files' && (
            <div className="p-4 space-y-3">
              <button
                onClick={() => setShowUploadModal(true)}
                className="w-full flex items-center justify-center gap-2 p-4 border border-dashed border-white/20 rounded-xl text-gray-400 hover:text-brand-gold active:text-brand-gold hover:border-brand-gold/50 active:border-brand-gold transition-colors touch-manipulation"
              >
                <Upload className="w-5 h-5" />
                <span className="text-sm">Upload File</span>
              </button>
              {documents.map(doc => (
                <div
                  key={doc.id}
                  className="flex items-center gap-3 p-4 rounded-xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation group"
                >
                  <div className="p-2 rounded-lg bg-brand-gold/10">
                    {doc.type === 'image' ? <Image className="w-5 h-5 text-brand-gold" /> :
                     doc.type === 'pdf' ? <FileText className="w-5 h-5 text-red-400" /> :
                     <File className="w-5 h-5 text-brand-gold" />}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-white truncate">{doc.name}</p>
                    <p className="text-[10px] text-gray-500">
                      {doc.uploadedByName} • {new Date(doc.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                  <button
                    onClick={() => deleteDocument(doc.id)}
                    className="p-3 text-gray-600 hover:text-red-400 active:text-red-500 touch-manipulation"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-center py-8">
                  <FolderOpen className="w-12 h-12 text-gray-600 mx-auto mb-3" />
                  <p className="text-sm text-gray-500">No files shared yet</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Main Chat Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {activeTab === 'chat' ? (
          <ChatArea
            channelId={selectedChannel}
            recipient={selectedUser}
            currentUser={currentUser}
            onOpenSidebar={() => setShowSidebar(true)}
          />
        ) : activeTab === 'members' ? (
          <MembersPanel users={users} currentUser={currentUser} onOpenSidebar={() => setShowSidebar(true)} />
        ) : (
          <FilesPanel
            documents={documents}
            uploadDocument={uploadDocument}
            deleteDocument={deleteDocument}
            currentUser={currentUser}
            onOpenSidebar={() => setShowSidebar(true)}
          />
        )}
      </div>

      {/* Upload Modal */}
      {showUploadModal && (
        <UploadModal
          onClose={() => setShowUploadModal(false)}
          onUpload={uploadDocument}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

// Chat Area Component
const ChatArea: React.FC<{
  channelId: string;
  recipient: User | null;
  currentUser: User | null;
  onOpenSidebar: () => void;
}> = ({ channelId, recipient, currentUser, onOpenSidebar }) => {
  const { messages, sendMessage } = useMessages({
    channelId: recipient ? undefined : channelId,
    recipientId: recipient?.id
  });
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    sendMessage(input);
    setInput('');
  };

  return (
    <>
      {/* Header */}
      <div className="h-16 border-b border-white/5 flex items-center justify-between px-4 md:px-6 bg-black/40">
        <div className="flex items-center gap-3">
          {/* Mobile menu button */}
          <button 
            onClick={onOpenSidebar}
            className="md:hidden p-2 text-gray-400 hover:text-white active:text-brand-gold touch-manipulation"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          {recipient ? (
            <>
              <img
                src={recipient.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${recipient.name}`}
                alt={recipient.name}
                className="w-10 h-10 rounded-xl"
              />
              <div>
                <h3 className="text-sm font-bold text-white">{recipient.name}</h3>
                <p className="text-[10px] text-gray-500">{recipient.status === 'online' ? 'Online' : 'Offline'}</p>
              </div>
            </>
          ) : (
            <>
              <div className="p-2 rounded-xl bg-brand-gold/10">
                <Hash className="w-5 h-5 text-brand-gold" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-white capitalize">{channelId}</h3>
                <p className="text-[10px] text-gray-500">Team channel</p>
              </div>
            </>
          )}
        </div>
        <div className="flex items-center gap-1">
          {recipient && (
            <>
              <button className="p-3 text-gray-500 hover:text-white active:text-brand-gold rounded-lg hover:bg-white/5 touch-manipulation">
                <Phone className="w-5 h-5" />
              </button>
              <button className="p-3 text-gray-500 hover:text-white active:text-brand-gold rounded-lg hover:bg-white/5 touch-manipulation">
                <Video className="w-5 h-5" />
              </button>
            </>
          )}
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto overscroll-contain p-4 md:p-6 space-y-4">
        {messages.length === 0 ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center px-4">
              <MessageCircle className="w-16 h-16 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">
                {recipient ? `Start chatting with ${recipient.name}` : `Welcome to #${channelId}`}
              </h3>
              <p className="text-sm text-gray-500">
                {recipient ? 'Send a message to begin the conversation' : 'This is the beginning of the channel'}
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg, i) => {
            const isOwn = msg.senderId === currentUser?.id;
            const showAvatar = i === 0 || messages[i - 1]?.senderId !== msg.senderId;
            return (
              <div key={msg.id} className={`flex gap-3 ${isOwn ? 'flex-row-reverse' : ''}`}>
                {showAvatar ? (
                  <img
                    src={msg.senderAvatar || `https://api.dicebear.com/7.x/initials/svg?seed=${msg.senderName}`}
                    alt={msg.senderName}
                    className="w-8 h-8 rounded-lg flex-shrink-0"
                  />
                ) : (
                  <div className="w-8 flex-shrink-0" />
                )}
                <div className={`max-w-[80%] md:max-w-[70%] ${isOwn ? 'text-right' : ''}`}>
                  {showAvatar && (
                    <div className={`flex items-center gap-2 mb-1 ${isOwn ? 'flex-row-reverse' : ''}`}>
                      <span className="text-xs font-medium text-white">{msg.senderName}</span>
                      <span className="text-[10px] text-gray-500">
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  )}
                  <div className={`inline-block p-3 rounded-2xl text-sm ${
                    isOwn
                      ? 'bg-brand-gold text-black rounded-tr-sm'
                      : 'bg-white/10 text-white rounded-tl-sm'
                  }`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Input */}
      <div className="p-3 md:p-4 border-t border-white/5 bg-black/40">
        <div className="flex items-center gap-2 md:gap-3 bg-white/5 rounded-xl p-2">
          <button className="p-2 text-gray-500 hover:text-brand-gold active:text-brand-gold touch-manipulation">
            <Plus className="w-5 h-5" />
          </button>
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSend()}
            placeholder={`Message ${recipient?.name || '#' + channelId}...`}
            className="flex-1 bg-transparent text-sm text-white placeholder-gray-500 focus:outline-none min-w-0"
          />
          <button className="hidden sm:block p-2 text-gray-500 hover:text-brand-gold touch-manipulation">
            <Smile className="w-5 h-5" />
          </button>
          <button
            onClick={handleSend}
            disabled={!input.trim()}
            className="p-3 bg-brand-gold text-black rounded-lg hover:bg-brand-gold/90 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed touch-manipulation transition-transform"
          >
            <Send className="w-5 h-5" />
          </button>
        </div>
      </div>
    </>
  );
};

// Members Panel Component
const MembersPanel: React.FC<{ users: User[]; currentUser: User | null; onOpenSidebar: () => void }> = ({ users, currentUser, onOpenSidebar }) => {
  const online = users.filter(u => u.status === 'online');
  const offline = users.filter(u => u.status !== 'online');

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-black/90 backdrop-blur-lg p-4 border-b border-white/5 flex items-center gap-3">
        <button onClick={onOpenSidebar} className="p-2 text-gray-400 hover:text-white touch-manipulation">
          <ChevronLeft className="w-5 h-5" />
        </button>
        <h2 className="text-lg font-bold text-white">Team Directory</h2>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Team Directory</h2>
              <p className="text-sm text-gray-500">{users.length} members • {online.length} online</p>
            </div>
            <button className="flex items-center gap-2 px-4 py-3 bg-brand-gold text-black font-medium rounded-xl hover:bg-brand-gold/90 active:scale-95 touch-manipulation">
              <UserPlus className="w-4 h-4" />
              Invite
            </button>
          </div>

          {/* Mobile Stats */}
          <div className="md:hidden mb-6">
            <p className="text-sm text-gray-500">{users.length} members • {online.length} online</p>
          </div>

          {/* Online Members */}
          {online.length > 0 && (
            <div className="mb-8">
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Online — {online.length}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {online.map(user => (
                  <MemberCard key={user.id} user={user} isCurrentUser={user.id === currentUser?.id} />
                ))}
              </div>
            </div>
          )}

          {/* Offline Members */}
          {offline.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-4">Offline — {offline.length}</h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {offline.map(user => (
                  <MemberCard key={user.id} user={user} isCurrentUser={user.id === currentUser?.id} />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const MemberCard: React.FC<{ user: User; isCurrentUser: boolean }> = ({ user, isCurrentUser }) => (
  <div className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation">
    <div className="relative">
      <img
        src={user.avatar || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`}
        alt={user.name}
        className="w-14 h-14 rounded-xl"
      />
      <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full border-2 border-[#0a0a0a] ${
        user.status === 'online' ? 'bg-green-500' :
        user.status === 'away' ? 'bg-yellow-500' : 'bg-gray-500'
      }`} />
    </div>
    <div className="flex-1 min-w-0">
      <div className="flex items-center gap-2">
        <h4 className="text-sm font-bold text-white truncate">{user.name}</h4>
        {isCurrentUser && (
          <span className="text-[10px] px-2 py-0.5 bg-brand-gold/20 text-brand-gold rounded-full flex-shrink-0">You</span>
        )}
      </div>
      <p className="text-xs text-gray-500 truncate">{user.role || user.title || 'Team Member'}</p>
    </div>
    <div className="text-[10px] text-gray-500 hidden sm:block">
      {new Date(user.joinedAt).toLocaleDateString()}
    </div>
  </div>
);

// Files Panel Component
const FilesPanel: React.FC<{
  documents: Document[];
  uploadDocument: any;
  deleteDocument: any;
  currentUser: User | null;
  onOpenSidebar: () => void;
}> = ({ documents, uploadDocument, deleteDocument, currentUser, onOpenSidebar }) => {
  const [showUpload, setShowUpload] = useState(false);

  return (
    <div className="flex-1 overflow-y-auto overscroll-contain">
      {/* Mobile Header */}
      <div className="md:hidden sticky top-0 bg-black/90 backdrop-blur-lg p-4 border-b border-white/5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={onOpenSidebar} className="p-2 text-gray-400 hover:text-white touch-manipulation">
            <ChevronLeft className="w-5 h-5" />
          </button>
          <h2 className="text-lg font-bold text-white">Shared Files</h2>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="p-2 bg-brand-gold text-black rounded-lg touch-manipulation"
        >
          <Upload className="w-5 h-5" />
        </button>
      </div>

      <div className="p-4 md:p-8">
        <div className="max-w-4xl mx-auto">
          <div className="hidden md:flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-bold text-white">Shared Files</h2>
              <p className="text-sm text-gray-500">{documents.length} files shared</p>
            </div>
            <button
              onClick={() => setShowUpload(true)}
              className="flex items-center gap-2 px-4 py-3 bg-brand-gold text-black font-medium rounded-xl hover:bg-brand-gold/90 active:scale-95 touch-manipulation"
            >
              <Upload className="w-4 h-4" />
              Upload File
            </button>
          </div>

          {documents.length === 0 ? (
            <div className="text-center py-16">
              <FolderOpen className="w-20 h-20 text-gray-700 mx-auto mb-4" />
              <h3 className="text-lg font-bold text-white mb-2">No files yet</h3>
              <p className="text-sm text-gray-500 mb-6">Upload files to share with your team</p>
              <button
                onClick={() => setShowUpload(true)}
                className="px-6 py-3 bg-brand-gold text-black font-medium rounded-xl active:scale-95 touch-manipulation"
              >
                Upload First File
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {documents.map(doc => (
                <div key={doc.id} className="p-4 rounded-2xl bg-white/5 hover:bg-white/10 active:bg-white/15 transition-colors touch-manipulation group">
                  <div className="flex items-start justify-between mb-3">
                    <div className="p-3 rounded-xl bg-brand-gold/10">
                      {doc.type === 'image' ? <Image className="w-6 h-6 text-brand-gold" /> :
                       doc.type === 'pdf' ? <FileText className="w-6 h-6 text-red-400" /> :
                       <File className="w-6 h-6 text-brand-gold" />}
                    </div>
                    <button
                      onClick={() => deleteDocument(doc.id)}
                      className="p-2 text-gray-600 hover:text-red-400 active:text-red-500 touch-manipulation"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                  <h4 className="text-sm font-medium text-white truncate mb-1">{doc.name}</h4>
                  <p className="text-[10px] text-gray-500">
                    {doc.uploadedByName} • {new Date(doc.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {showUpload && (
        <UploadModal
          onClose={() => setShowUpload(false)}
          onUpload={uploadDocument}
          currentUser={currentUser}
        />
      )}
    </div>
  );
};

// Upload Modal
const UploadModal: React.FC<{
  onClose: () => void;
  onUpload: any;
  currentUser: User | null;
}> = ({ onClose, onUpload, currentUser }) => {
  const [name, setName] = useState('');
  const [type, setType] = useState<'pdf' | 'doc' | 'image' | 'other'>('doc');
  const [tags, setTags] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !currentUser) return;

    onUpload({
      name,
      type,
      size: Math.floor(Math.random() * 5000000),
      sharedWith: [],
      tags: tags.split(',').map(t => t.trim()).filter(Boolean)
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-end sm:items-center justify-center z-50 p-0 sm:p-4">
      <div className="w-full sm:max-w-md bg-[#111] border-t sm:border border-white/10 rounded-t-2xl sm:rounded-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-white/10 sticky top-0 bg-[#111]">
          <h3 className="text-lg font-bold text-white">Upload File</h3>
          <button onClick={onClose} className="p-2 text-gray-500 hover:text-white touch-manipulation">
            <X className="w-5 h-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">File Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-brand-gold focus:outline-none text-base"
              placeholder="Document name..."
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value as any)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-brand-gold focus:outline-none text-base"
            >
              <option value="doc">Document</option>
              <option value="pdf">PDF</option>
              <option value="image">Image</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-400 mb-2 uppercase">Tags (comma separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:border-brand-gold focus:outline-none text-base"
              placeholder="client, proposal, 2024..."
            />
          </div>
          <div className="flex gap-3 pt-2 pb-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 bg-white/5 text-white rounded-lg hover:bg-white/10 active:bg-white/15 touch-manipulation text-base font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-4 bg-brand-gold text-black font-bold rounded-lg hover:bg-brand-gold/90 active:scale-[0.98] touch-manipulation text-base"
            >
              Upload
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TeamModule;
