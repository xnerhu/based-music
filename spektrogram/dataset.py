from torch.utils.data import Dataset
import torchaudio
from os import listdir, path


class AudioDataset(Dataset):
    def __init__(self, path: str, transform: torchaudio.transforms.MelSpectrogram):
        super().__init__()

        self.path = path
        self.files = listdir(path)
        self.length = len(self.files)
        self.transform = transform

    def __getitem__(self, index):
        filename = self.files[index]

        signal, sample_rate = torchaudio.load(path.join(self.path, filename))
        signal = self.transform(signal)

        filename = path.splitext(filename)[0]

        return signal, filename

    def __len__(self):
        return self.length
